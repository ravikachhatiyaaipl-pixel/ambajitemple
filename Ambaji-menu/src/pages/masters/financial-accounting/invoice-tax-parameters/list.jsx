import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Percent,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Hash,
  ArrowLeft,
  Calculator,
  List,
  Briefcase,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  XCircle as XCircleIcon,
  CheckSquare,
  XSquare,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { InvoiceTaxParameterApi } from "../../../services/invoicetaxparameterapi";
import debounce from "lodash/debounce";

const InvoiceTaxParameterList = ({ user }) => {
  const [taxParameters, setTaxParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [pageTitle, setPageTitle] = useState("Vendor Invoice Tax Parameters");

  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      
      const currentPath = "/masters/financial-accounting/invoice-tax-parameter";
      
      const currentMenuItem = menuDetails.find(item => item.Menu_Links == currentPath);
      
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
      setPagination((prev) => ({ ...prev, current_page: 1 }));
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
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  // Load data when page or search changes
  useEffect(() => {
    loadTaxParameters();
  }, [pagination.current_page, searchDebounced]);

  const loadTaxParameters = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current_page,
        perPage: pagination.per_page,
        search: searchDebounced,
      };

      const response = await InvoiceTaxParameterApi.getAll(params);
      setTaxParameters(response.data);
      setPagination((prev) => ({
        ...prev,
        last_page: response.pagination.last_page,
        total: response.pagination.total,
        from: response.pagination.from || ((prev.current_page - 1) * prev.per_page + 1),
        to: response.pagination.to || Math.min(prev.current_page * prev.per_page, response.pagination.total),
      }));
      setSelectedItems([]);
    } catch (error) {
      toast.error(error.message || "Failed to load tax parameters");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
  };

  const handleDeleteParameter = async (parameterId, taxSummary) => {
    const result = await Swal.fire({
      title: "Delete Tax Parameters?",
      text: `Are you sure you want to delete these tax parameters? This action cannot be undone.`,
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
        await InvoiceTaxParameterApi.delete(parameterId);

        // Remove from selected items if present
        setSelectedItems((prev) => prev.filter((id) => id != parameterId));

        // Reload the data
        await loadTaxParameters();

        toast.success(`Tax parameters deleted successfully!`);
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(error.message || "Failed to delete tax parameters");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length == 0) {
      toast.error("No tax parameters selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedItems.length} selected tax parameters?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedItems.map((id) =>
          InvoiceTaxParameterApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadTaxParameters();
        setSelectedItems([]);
        toast.success(
          `${selectedItems.length} tax parameters deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some tax parameters");
      }
    }
  };

  const getTaxSummary = (parameter) => {
    const entries = parameter.parameters || [];
    if (entries.length == 0) return "No taxes";

    return entries
      .map(
        (entry) =>
          `${entry.invoice_charge?.IC_Name || `Tax ID ${entry.IC_Id}`} (${entry.Percent}%)`,
      )
      .slice(0, 2)
      .join(", ") + (entries.length > 2 ? ` +${entries.length - 2} more` : "");
  };

  const getAddDeductSummary = (parameter) => {
    const entries = parameter.parameters || [];
    const adds = entries.filter((e) => e.Add_Dedu == 1 || e.Add_Dedu == "1").length;
    const deducts = entries.filter((e) => e.Add_Dedu == 0 || e.Add_Dedu == "0").length;

    return `Add: ${adds}, Deduct: ${deducts}`;
  };

  // New function to get Exempt Allow summary
  const getExemptAllowSummary = (parameter) => {
    const entries = parameter.parameters || [];
    if (entries.length == 0) return "N/A";
    
    const exemptCount = entries.filter((e) => e.Exmp_Alw == "Yes" || e.Exmp_Alw == 1 || e.Exmp_Alw == "1").length;
    const nonExemptCount = entries.filter((e) => e.Exmp_Alw == "No" || e.Exmp_Alw == 0 || e.Exmp_Alw == "0" || !e.Exmp_Alw).length;
    
    if (exemptCount == 0) return "All Non-Exempt";
    if (nonExemptCount == 0) return "All Exempt";
    return `Exempt: ${exemptCount}, Non-Exempt: ${nonExemptCount}`;
  };

  const stats = {
    totalParameters: pagination.total,
    activeParameters: taxParameters.filter((p) => !p.deleted_at).length,
    totalTaxEntries: taxParameters.reduce(
      (sum, p) => sum + (p.parameters?.length || 0),
      0,
    ),
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

  const formatDateTime = (dateString) => {
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

    let startPage = Math.max(1, pagination.current_page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxVisiblePages - 1);

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
            to="/masters/financial-accounting/invoice-tax-parameter/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Tax Parameters
          </Link>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tender work..."
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
                onClick={handleClearSearch}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={loadTaxParameters}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

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
                  {selectedItems.length} parameter(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected parameters
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedItems.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
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
                        selectedItems.length == taxParameters.length &&
                        taxParameters.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(
                            taxParameters.map((c) => c.tnt_id),
                          );
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tender Work
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tax Parameters
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Add/Deduct
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Exempt Allow
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Effective Date
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
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading tax parameters...</p>
                    </div>
                  </td>
                </tr>
              ) : taxParameters.length > 0 ? (
                taxParameters.map((parameter) => (
                  <tr
                    key={parameter.tnt_id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/financial-accounting/invoice-tax-parameter/view/${parameter.tnt_id}`,
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
                          checked={selectedItems.includes(parameter.tnt_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([
                                ...selectedItems,
                                parameter.tnt_id,
                              ]);
                            } else {
                              setSelectedItems(
                                selectedItems.filter(
                                  (id) => id != parameter.tnt_id,
                                ),
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-150">
                            {parameter.tender?.TnT_Name || "Unknown Tender"}
                          </div>
                          {parameter.tender?.TnT_Code && (
                            <div className="text-xs text-gray-500 mt-1">
                              Code: {parameter.tender.TnT_Code}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getTaxSummary(parameter)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total: {parameter.parameters?.length || 0} entries
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {getAddDeductSummary(parameter)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {getExemptAllowSummary(parameter)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(parameter.eff_date)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/financial-accounting/invoice-tax-parameter/view/${parameter.tnt_id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/financial-accounting/invoice-tax-parameter/edit/${parameter.tnt_id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!parameter.deleted_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteParameter(
                                parameter.tnt_id,
                                getTaxSummary(parameter),
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
                          ? "No tax parameters found"
                          : "No tax parameters yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "No tax parameters match your search criteria. Try adjusting your search term."
                          : "Get started by creating your first tax parameters for vendor invoices."}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/financial-accounting/invoice-tax-parameter/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Tax Parameters
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
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  pagination.current_page == page
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page == pagination.last_page}
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

export default InvoiceTaxParameterList;