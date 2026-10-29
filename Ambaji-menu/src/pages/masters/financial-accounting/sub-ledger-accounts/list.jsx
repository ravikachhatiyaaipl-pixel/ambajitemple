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
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Hash,
  FolderTree,
  Phone,
  Mail,
  MapPin,
  User,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { SubLedgerAccountApi } from "../../../services/subledgeraccountapi";
import debounce from "lodash/debounce";

const SubledgerAccountList = ({ user }) => {
  const [subledgers, setSubledgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedSubledgers, setSelectedSubledgers] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [searchDebounced, setSearchDebounced] = useState("");
  const [pageTitle, setPageTitle] = useState("Vendor Registration");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/financial-accounting/sub-ledger-accounts";

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
    loadSubledgers();
  }, [currentPage, searchDebounced, filterStatus]);

  const loadSubledgers = async () => {
    setLoading(true);
    try {
      const result = await SubLedgerAccountApi.getAll(
        currentPage,
        itemsPerPage,
        searchDebounced,
      );

      if (result.success && result.data) {
        const apiData = result.data;

        setSubledgers(apiData.data || []);
        setPagination({
          current_page: apiData.current_page,
          last_page: apiData.last_page,
          per_page: apiData.per_page,
          total: apiData.total,
          from: apiData.from,
          to: apiData.to,
        });

        setSelectedSubledgers([]);
      } else {
        toast.error(result.message || "Failed to load subledgers");
        setSubledgers([]);
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
      console.error("Error loading subledgers:", error);
      toast.error("Failed to load subledgers");
      setSubledgers([]);
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

  const handleClearFilters = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setFilterStatus("");
    setCurrentPage(1);
  };

  const handleDeleteSubledger = async (subledgerId, subledgerName) => {
    const result = await Swal.fire({
      title: "Delete Subledger?",
      text: `Are you sure you want to delete "${subledgerName}"? This action cannot be undone.`,
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
        await SubLedgerAccountApi.delete(subledgerId);
        await loadSubledgers();
        toast.success(`Subledger "${subledgerName}" deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete subledger");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubledgers.length == 0) {
      toast.error("No subledgers selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedSubledgers.length} selected subledgers?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedSubledgers.map((id) =>
          SubLedgerAccountApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadSubledgers();
        setSelectedSubledgers([]);
        toast.success(
          `${selectedSubledgers.length} subledgers deleted successfully!`,
        );
      } catch (error) {
        toast.error(error.message || "Failed to delete some subledgers");
      }
    }
  };
  const stats = {
    totalSubledgers: pagination.total,
    activeSubledgers: subledgers.filter((s) => s.SL_Status).length,
    inactiveSubledgers: subledgers.filter((s) => !s.SL_Status).length,
    verifiedPAN: subledgers.filter((s) => s.PAN_Verified).length,
    verifiedGSTIN: subledgers.filter((s) => s.GSTIN_Verified).length,
  };

  const formatLedgerNames = (subledger) => {
    if (subledger.ledger_names && subledger.ledger_names.length > 0) {
      return subledger.ledger_names.join(", ");
    }

    if (
      subledger.ledgers &&
      Array.isArray(subledger.ledgers) &&
      subledger.ledgers.length > 0
    ) {
      return subledger.ledgers.map((l) => l.Lg_Name || "Unknown").join(", ");
    }

    return "No ledgers associated";
  };

  // Format ledger codes
  const formatLedgerCodes = (subledger) => {
    if (subledger.ledger_codes && subledger.ledger_codes.length > 0) {
      return subledger.ledger_codes.join(", ");
    }

    if (
      subledger.ledgers &&
      Array.isArray(subledger.ledgers) &&
      subledger.ledgers.length > 0
    ) {
      return subledger.ledgers.map((l) => l.Lg_Code || "N/A").join(", ");
    }

    return "N/A";
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || filterStatus;

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

  return (
    <div className="p-6">
      {/* Header with pageTitle from menu details */}
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
            to="/masters/financial-accounting/sub-ledger-accounts/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Subledger
          </Link>
        </div>
      </div>

      {/* Action Bar - Enhanced */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search with Clear button */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, code, contact, phone..."
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

          {/* Filters and Actions */}
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
              onClick={loadSubledgers}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions - Enhanced */}
        {selectedSubledgers.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedSubledgers.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedSubledgers.length} subledger(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected subledgers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedSubledgers([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedSubledgers.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subledgers Table - Enhanced with row click navigation */}
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
                        selectedSubledgers.length == subledgers.length &&
                        subledgers.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubledgers(subledgers.map((s) => s.SL_Id));
                        } else {
                          setSelectedSubledgers([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Subledger Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Parent Ledgers
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
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
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading subledgers...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : subledgers.length > 0 ? (
                subledgers.map((subledger) => (
                  <tr
                    key={subledger.SL_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/financial-accounting/sub-ledger-accounts/view/${subledger.SL_Id}`,
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
                          checked={selectedSubledgers.includes(subledger.SL_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubledgers([
                                ...selectedSubledgers,
                                subledger.SL_Id,
                              ]);
                            } else {
                              setSelectedSubledgers(
                                selectedSubledgers.filter(
                                  (id) => id != subledger.SL_Id,
                                ),
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
                            {subledger.SL_Name?.charAt(0) || "S"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-150">
                            {subledger.SL_Name}
                          </div>
                          {subledger.SL_Code && (
                            <div className="flex items-center mt-1">
                              <span className="text-xs font-medium text-gray-600">
                                {subledger.SL_Code}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {subledger.SL_Cont_Pers && (
                          <div className="flex items-center text-sm">
                            <User className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-600">
                              {subledger.SL_Cont_Pers}
                            </span>
                          </div>
                        )}
                        {subledger.SL_Phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-600">
                              {subledger.SL_Phone}
                            </span>
                          </div>
                        )}
                        {subledger.SL_Email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-600">
                              {subledger.SL_Email}
                            </span>
                          </div>
                        )}
                        {(subledger.SL_Address || subledger.SL_City) && (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-600 truncate max-w-[150px]">
                              {subledger.SL_City ||
                                subledger.SL_Address?.substring(0, 20)}
                              {subledger.SL_Address?.length > 20 && "..."}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <FolderTree className="h-4 w-4 text-blue-500 mr-2" />
                          <div>
                            <div className="text-xs text-gray-900 font-medium">
                              {formatLedgerNames(subledger)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {subledger.SL_Status ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(subledger.created_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(subledger.created_at)}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/financial-accounting/sub-ledger-accounts/view/${subledger.SL_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/financial-accounting/sub-ledger-accounts/edit/${subledger.SL_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!subledger.deleted_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSubledger(
                                subledger.SL_Id,
                                subledger.SL_Name,
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
                        <Layers className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No matching subledgers found"
                          : "No subledgers found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first subledger"}
                      </p>
                      {hasActiveFilters ? (
                        <button
                          onClick={handleClearFilters}
                          className="inline-flex items-center px-5 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all duration-200"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear All Filters
                        </button>
                      ) : (
                        <Link
                          to="/masters/financial-accounting/sub-ledger-accounts/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Subledger
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
              entries
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
                  Math.min(pagination.last_page, prev + 1),
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

export default SubledgerAccountList;
