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
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  XCircle,
  RefreshCw,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Banknote,
  CheckCircle,
  Landmark,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SubLedgerAccountApi } from "../../../services/subledgeraccountapi";
import debounce from "lodash/debounce";

const VendorBkCheckList = ({ user }) => {
  const [vendorChecks, setVendorChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [searchDebounced, setSearchDebounced] = useState("");
  const [pageTitle, setPageTitle] = useState("Vendor Bank Check Register");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/financial-accounting/vendor-check-register";

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

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchDebounced(value);
      setCurrentPage(1);
    }, 500),
    [],
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

  useEffect(() => {
    loadVendorChecks();
  }, [currentPage, searchDebounced]);

  const loadVendorChecks = async () => {
    setLoading(true);
    try {
      // Pass filter for Is_cnl_cheq
      const result = await SubLedgerAccountApi.getAll(
        currentPage,
        itemsPerPage,
        searchDebounced,
        { Is_cnl_cheq: "Y" }, // ← Add filter here
      );

      if (result.success && result.data) {
        const apiData = result.data;

        // No client-side filtering needed anymore
        setVendorChecks(apiData.data);
        setPagination({
          current_page: apiData.current_page,
          last_page: apiData.last_page,
          per_page: apiData.per_page,
          total: apiData.total,
          from: apiData.from,
          to: apiData.to,
        });
        setSelectedItems([]);
      } else {
        toast.error(result.message || "Failed to load data");
        setVendorChecks([]);
      }
    } catch (error) {
      console.error("Error loading vendor bank checks:", error);
      toast.error("Failed to load data");
      setVendorChecks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setCurrentPage(1);
  };

  const handleDelete = async (id, vendorName) => {
    const result = await Swal.fire({
      title: "Delete Record?",
      text: `Are you sure you want to delete "${vendorName}"? This action cannot be undone.`,
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
        const data = { Is_cnl_cheq: "N" };

        await SubLedgerAccountApi.update(id, data);
        await loadVendorChecks();
        toast.success(`Record deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete record");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length == 0) {
      toast.error("No records selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedItems.length} selected records?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedItems.map((id) =>
          SubLedgerAccountApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadVendorChecks();
        setSelectedItems([]);
        toast.success(`${selectedItems.length} records deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete some records");
      }
    }
  };

  const stats = {
    total: pagination.total,
    withDocument: vendorChecks.filter((v) => v.Documents).length,
    withoutDocument: vendorChecks.filter((v) => !v.Documents).length,
  };

  const hasActiveFilters = searchTerm;

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
            <p className="text-gray-600 mt-1">
              Manage vendor bank account details and check information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/financial-accounting/vendor-check-register/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Record
          </Link>
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
                placeholder="Search by vendor name, bank name, account number..."
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
              onClick={loadVendorChecks}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
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
                  {selectedItems.length} record(s) selected
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedItems.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={
                        selectedItems.length == vendorChecks.length &&
                        vendorChecks.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(vendorChecks.map((v) => v.SL_Id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Vendor Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Bank Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Account Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  CNL Cheq
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
                      <p className="mt-4 text-gray-600">Loading records...</p>
                    </div>
                  </td>
                </tr>
              ) : vendorChecks.length > 0 ? (
                vendorChecks.map((item) => (
                  <tr
                    key={item.SL_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/financial-accounting/vendor-check-register/view/${item.SL_Id}`,
                        );
                      }
                    }}
                  >
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedItems.includes(item.SL_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.SL_Id]);
                            } else {
                              setSelectedItems(
                                selectedItems.filter((id) => id != item.SL_Id),
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {item.SL_Name?.charAt(0) || "V"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {item.SL_Name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Landmark className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {item.Bank_Name || "N/A"}
                        </span>
                      </div>
                      {item.Branch_Name && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.Branch_Name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {item.Account_Holder_Name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.Account_Number
                          ? `****${item.Account_Number.slice(-4)}`
                          : "N/A"}
                      </div>
                      {item.IFSC_Code && (
                        <div className="text-xs text-gray-500 mt-1">
                          IFSC: {item.IFSC_Code}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.Documents ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Uploaded
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Uploaded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.Is_cnl_cheq == "Y" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          No
                        </span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/financial-accounting/vendor-check-register/view/${item.SL_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/financial-accounting/vendor-check-register/edit/${item.SL_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.SL_Id, item.SL_Name)}
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
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Banknote className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No matching records found"
                          : "No records found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {hasActiveFilters
                          ? "Try adjusting your search"
                          : "Get started by adding your first vendor bank check record"}
                      </p>
                      {hasActiveFilters ? (
                        <button
                          onClick={handleClearFilters}
                          className="inline-flex items-center px-5 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear All Filters
                        </button>
                      ) : (
                        <Link
                          to="/masters/financial-accounting/vendor-check-register/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Record
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
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
              entries
              {hasActiveFilters && " (filtered)"}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

export default VendorBkCheckList;
