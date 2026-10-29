import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Percent,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Hash,
  Copy,
  BookOpen,
  ChevronRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { VendorInvoiceTaxesApi } from "../../../services/vendorinvoicetaxesapi";
import debounce from "lodash/debounce";

const VendorInvoiceTaxesList = ({ user }) => {
  const [taxTypes, setTaxTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTaxTypes, setSelectedTaxTypes] = useState([]);
  const [sortField, setSortField] = useState("IC_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Tax Type Master");

  const navigate = useNavigate();

  // Load page title from menu details - ONLY IN LIST COMPONENT
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/financial-accounting/vendor-invoice-taxes";

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

  useEffect(() => {
    loadTaxTypes();
  }, [currentPage, searchDebounced]);

  const loadTaxTypes = async () => {
    setLoading(true);
    try {
      const result = await VendorInvoiceTaxesApi.getAll({
        page: currentPage,
        perPage: itemsPerPage,
        search: searchDebounced,
      });

      setTaxTypes(result.data);
      setPagination({
        current_page: result.pagination.current_page,
        last_page: result.pagination.last_page,
        per_page: result.pagination.per_page,
        total: result.pagination.total,
        from: result.pagination.from,
        to: result.pagination.to,
      });
      setSelectedTaxTypes([]);
    } catch (error) {
      toast.error(error.message || "Failed to load tax types");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField == field) {
      setSortDirection(sortDirection == "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort tax types (client-side sorting)
  const sortedTaxTypes = [...taxTypes].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle nested fields
    if (sortField == "ledger") {
      aValue = a.ledger?.Lg_Name || "";
      bValue = b.ledger?.Lg_Name || "";
    } else if (sortField == "Percentage") {
      aValue = parseFloat(a.Percentage) || 0;
      bValue = parseFloat(b.Percentage) || 0;
    }

    if (aValue < bValue) return sortDirection == "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  // Filter tax types - Frontend only filtering
  const filteredTaxTypes = sortedTaxTypes.filter((taxType) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      taxType.IC_Name?.toLowerCase().includes(searchLower) ||
      taxType.IC_Code?.toLowerCase().includes(searchLower) ||
      taxType.Percentage?.toString().includes(searchTerm) ||
      taxType.ledger?.Lg_Code?.toLowerCase().includes(searchLower) ||
      taxType.ledger?.Lg_Name?.toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteTaxType = async (taxTypeId, taxTypeName) => {
    const result = await Swal.fire({
      title: "Delete Tax Type?",
      text: `Are you sure you want to delete "${taxTypeName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await VendorInvoiceTaxesApi.delete(taxTypeId);
        await loadTaxTypes();
        toast.success(`Tax type "${taxTypeName}" deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete tax type");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTaxTypes.length == 0) {
      toast.error("No tax types selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedTaxTypes.length} selected tax types?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedTaxTypes.map((id) =>
          VendorInvoiceTaxesApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadTaxTypes();
        setSelectedTaxTypes([]);
        toast.success(
          `${selectedTaxTypes.length} tax types deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some tax types");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const stats = {
    totalTaxTypes: pagination.total,
    averagePercentage:
      taxTypes.length > 0
        ? (
            taxTypes.reduce(
              (sum, t) => sum + parseFloat(t.Percentage || 0),
              0,
            ) / taxTypes.length
          ).toFixed(2)
        : "0.00",
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

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      pagination.last_page,
      startPage + maxVisiblePages - 1,
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm;

  return (
    <div className="p-6">
      {/* Header - WITH pageTitle from menu details */}
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
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/financial-accounting/vendor-invoice-taxes/create"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Tax Type
          </Link>
        </div>
      </div>

      {/* Action Bar - Enhanced */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search with Clear button */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tax name, code, percentage..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}
            <button
              onClick={loadTaxTypes}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTaxTypes.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedTaxTypes.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedTaxTypes.length} tax type(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected tax types
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedTaxTypes([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedTaxTypes.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tax Types Table - Enhanced with row click navigation */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                      checked={
                        selectedTaxTypes.length == taxTypes.length &&
                        taxTypes.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTaxTypes(taxTypes.map((c) => c.IC_Id));
                        } else {
                          setSelectedTaxTypes([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("IC_Code")}
                >
                  <div className="flex items-center">
                    Tax Code
                    {sortField == "IC_Code" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("IC_Name")}
                >
                  <div className="flex items-center">
                    Tax Name
                    {sortField == "IC_Name" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Percentage")}
                >
                  <div className="flex items-center">
                    Percentage
                    {sortField == "Percentage" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ledger Account
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
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
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
                      <p className="mt-4 text-gray-600">Loading tax types...</p>
                    </div>
                  </td>
                </tr>
              ) : taxTypes.length > 0 ? (
                taxTypes.map((taxType) => (
                  <tr
                    key={taxType.IC_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/financial-accounting/vendor-invoice-taxes/view/${taxType.IC_Id}`,
                        );
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                          checked={selectedTaxTypes.includes(taxType.IC_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTaxTypes([
                                ...selectedTaxTypes,
                                taxType.IC_Id,
                              ]);
                            } else {
                              setSelectedTaxTypes(
                                selectedTaxTypes.filter(
                                  (id) => id != taxType.IC_Id,
                                ),
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {taxType.IC_Code?.charAt(0) || "T"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <Hash className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors duration-150">
                              {taxType.IC_Code || "—"}
                            </span>
                          </div>
                        </div>
                        {taxType.IC_Code && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyToClipboard(taxType.IC_Code);
                            }}
                            className="ml-2 p-1 hover:bg-green-50 rounded transition-colors"
                            title="Copy code"
                          >
                            <Copy className="h-3 w-3 text-gray-400 hover:text-green-600" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-150">
                        {taxType.IC_Name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-green-600">
                          {taxType.Percentage
                            ? parseFloat(taxType.Percentage).toFixed(2) + "%"
                            : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {taxType.ledger ? (
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <BookOpen className="h-3 w-3 text-blue-500 mr-1" />
                            <span className="font-medium text-gray-900">
                              {taxType.ledger.Lg_Code}
                            </span>
                            <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                            <span className="text-gray-700">
                              {taxType.ledger.Lg_Name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                            {taxType.ledger.Lg_Gr}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          No ledger assigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(taxType.created_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(taxType.created_at)}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/financial-accounting/vendor-invoice-taxes/view/${taxType.IC_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/financial-accounting/vendor-invoice-taxes/edit/${taxType.IC_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!taxType.deleted_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTaxType(
                                taxType.IC_Id,
                                taxType.IC_Name,
                              );
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Percent className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No matching tax types found"
                          : "No tax types found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding your first tax type"}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/financial-accounting/vendor-invoice-taxes/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Tax Type
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

      {/* Pagination - Enhanced */}
      {pagination.last_page > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
              tax types
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
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-sm"
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
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorInvoiceTaxesList;
