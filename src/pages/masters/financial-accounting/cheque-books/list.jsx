import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
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
  Printer,
  Building2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ChequeBooksApi } from "../../../services/chequebooksapi";
import debounce from "lodash/debounce";
import axios from "axios";

const ChequeBooksList = ({ user }) => {
  const [chequeBooks, setChequeBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedChequeBooks, setSelectedChequeBooks] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Cheque Book Management");

  // Filters
  const [bookReferenceFilter, setBookReferenceFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [formats, setFormats] = useState([]);
  const [loadingFormats, setLoadingFormats] = useState(false);

  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/financial-accounting/cheque-books";

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

  // Load cheque formats for filter
  useEffect(() => {
    loadFormats();
  }, []);

  const loadFormats = async () => {
    setLoadingFormats(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_BASE_URL}/cheque-formats/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.data.success) {
        let formatsData = response.data.data || response.data.formats || [];
        const activeFormats = formatsData.filter(
          (format) => format.is_active ==  true || format.status ==  12
        );
        setFormats(activeFormats);
      } else {
        setFormats([]);
      }
    } catch (error) {
      console.error("Error loading formats for filter:", error);
      setFormats([]);
    } finally {
      setLoadingFormats(false);
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

  // Handle book reference filter change
  const handleBookReferenceChange = (e) => {
    setBookReferenceFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle format filter change
  const handleFormatFilterChange = (e) => {
    setFormatFilter(e.target.value);
    setCurrentPage(1);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setBookReferenceFilter("");
    setFormatFilter("");
    setCurrentPage(1);
  };

  // Load cheque books when page, search, or filter changes
  useEffect(() => {
    loadChequeBooks();
  }, [currentPage, searchDebounced, bookReferenceFilter, formatFilter]);

  const loadChequeBooks = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (bookReferenceFilter) {
        filters.book_reference = bookReferenceFilter;
      }
      if (formatFilter) {
        filters.cheque_format_id = formatFilter;
      }

      const result = await ChequeBooksApi.getAllChequeBooks(
        currentPage,
        itemsPerPage,
        searchDebounced,
        filters,
      );

      setChequeBooks(result.chequeBooks || []);
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
      console.error("Error loading cheque books:", error);
      toast.error(
        error.response?.data?.message || "Failed to load cheque books",
      );
      setChequeBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChequeBook = async (chequeBookId, bookReference) => {
    const result = await Swal.fire({
      title: "Delete Cheque Book?",
      text: `Are you sure you want to delete "${bookReference}"? This action cannot be undone.`,
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
      await ChequeBooksApi.delete(chequeBookId);
      toast.success(`Cheque Book "${bookReference}" deleted successfully!`);
      await loadChequeBooks();
      setSelectedChequeBooks(
        selectedChequeBooks.filter((id) => id != chequeBookId),
      );
    } catch (error) {
      console.error("Error deleting cheque book:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete cheque book",
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedChequeBooks.length == 0) {
      toast.error("No cheque books selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedChequeBooks.length} selected cheque books?`,
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
        const deletePromises = selectedChequeBooks.map((id) =>
          ChequeBooksApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadChequeBooks();
        setSelectedChequeBooks([]);
        toast.success(
          `${selectedChequeBooks.length} cheque book(s) deleted successfully!`,
        );
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Failed to delete some cheque books");
        await loadChequeBooks();
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDateOnly = (dateString) => {
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

  const hasActiveFilters = searchTerm != "" || bookReferenceFilter != "" || formatFilter != "";

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedChequeBooks(chequeBooks.map((cb) => cb.cheque_book_id));
    } else {
      setSelectedChequeBooks([]);
    }
  };

  const handleSelectChequeBook = (chequeBookId, checked) => {
    if (checked) {
      setSelectedChequeBooks([...selectedChequeBooks, chequeBookId]);
    } else {
      setSelectedChequeBooks(
        selectedChequeBooks.filter((id) => id != chequeBookId),
      );
    }
  };

  // Get usage percentage
  const getUsagePercentage = (used, total) => {
    if (!total || total == 0) return 0;
    return Math.round((used / total) * 100);
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
              Manage cheque books for financial accounting
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/financial-accounting/cheque-books/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Cheque Book
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
              placeholder="Search cheque books by book reference, issued bank..."
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

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={bookReferenceFilter}
              onChange={handleBookReferenceChange}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[180px]"
            >
              <option value="">All Book References</option>
              {chequeBooks.map((book) => (
                <option key={book.cheque_book_id} value={book.book_reference}>
                  {book.book_reference}
                </option>
              ))}
            </select>

            {/* <select
              value={formatFilter}
              onChange={handleFormatFilterChange}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[200px]"
              disabled={loadingFormats}
            >
              <option value="">All Cheque Formats</option>
              {formats.length > 0 ? (
                formats.map((format) => (
                  <option key={format.cheque_format_id} value={format.cheque_format_id}>
                    {format.format_name || `Format #${format.cheque_format_id}`}
                  </option>
                ))
              ) : (
                <option disabled>No formats available</option>
              )}
            </select> */}

            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}

            <button
              onClick={loadChequeBooks}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {selectedChequeBooks.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedChequeBooks.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedChequeBooks.length} cheque book(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected cheque books
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedChequeBooks([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 flex items-center disabled:opacity-50 transition-colors"
              >
                {loading ? "Deleting..." : "Delete Selected"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cheque Books Table */}
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
                      chequeBooks.length > 0 &&
                      selectedChequeBooks.length == chequeBooks.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Book Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Leaf Range
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Cheque Format
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Book Account
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
                        Loading cheque books...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : chequeBooks.length > 0 ? (
                chequeBooks.map((chequeBook) => {
                  const usagePercentage = getUsagePercentage(
                    chequeBook.used_leaves || 0,
                    chequeBook.total_leaves || 0,
                  );
                  // Get bank account from bank_account or bank property
                  const bankAccount = chequeBook.bank_account || chequeBook.bank;
                  return (
                    <tr
                      key={chequeBook.cheque_book_id}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/masters/financial-accounting/cheque-books/view/${chequeBook.cheque_book_id}`,
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
                          checked={selectedChequeBooks.includes(
                            chequeBook.cheque_book_id,
                          )}
                          onChange={(e) =>
                            handleSelectChequeBook(
                              chequeBook.cheque_book_id,
                              e.target.checked,
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                              {chequeBook.book_reference}
                            </div>
                            {chequeBook.issued_by_bank && (
                              <div className="text-xs text-gray-500 mt-0.5 truncate">
                                Issued: {chequeBook.issued_by_bank}
                              </div>
                            )}
                            {chequeBook.received_date && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                Received: {formatDateOnly(chequeBook.received_date)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-mono font-medium text-gray-900">
                              {chequeBook.leaf_from} - {chequeBook.leaf_to}
                            </span>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Total: {chequeBook.total_leaves} leaves
                          </span>                          
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {chequeBook.cheque_format ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Printer className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                {chequeBook.cheque_format.format_name}
                              </span>
                            </div>
                            {chequeBook.cheque_format.description && (
                              <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                {chequeBook.cheque_format.description}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {bankAccount ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                {bankAccount.Lg_Name || bankAccount.bank_name || "N/A"}
                              </div>
                            </div>
                            {/* {bankAccount.Lg_Code && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                Code: {bankAccount.Lg_Code}
                              </div>
                            )} */}
                            {bankAccount.Lg_Eng_Name && bankAccount.Lg_Eng_Name !=  bankAccount.Lg_Name && (
                              <div className="text-xs text-gray-400 truncate max-w-[120px]">
                                {bankAccount.Lg_Eng_Name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not specified
                          </span>
                        )}
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/financial-accounting/cheque-books/view/${chequeBook.cheque_book_id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/financial-accounting/cheque-books/edit/${chequeBook.cheque_book_id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChequeBook(
                                chequeBook.cheque_book_id,
                                chequeBook.book_reference,
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No matching cheque books found"
                          : "No cheque books found"}
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md text-center">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters to find what you're looking for."
                          : "Get started by adding your first cheque book. Cheque books help you track bank cheque inventory."}
                      </p>
                      {!hasActiveFilters && (
                        <Link
                          to="/masters/financial-accounting/cheque-books/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Cheque Book
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
          <div className="flex items-center space-x-1 flex-wrap gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
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
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-sm"
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

export default ChequeBooksList;