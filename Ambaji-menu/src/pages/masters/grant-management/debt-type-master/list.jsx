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

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingDown,
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
  Scale,
  CreditCard,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DebtTypeMasterApi } from "../../../services/debttypemasterapi";

const DebtTypeList = ({ user }) => {
  const [debtTypes, setDebtTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLiabilityType, setFilterLiabilityType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedDebtTypes, setSelectedDebtTypes] = useState([]);
  const [sortField, setSortField] = useState("DT_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Debt Type Master");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/grant-management/debt-type-master";

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

  useEffect(() => {
    loadDebtTypes();
  }, [currentPage, searchTerm]);

  const loadDebtTypes = async () => {
    setLoading(true);
    try {
      const response = await DebtTypeMasterApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      setDebtTypes(response.data);
      setPagination(response.pagination);
      setSelectedDebtTypes([]);
    } catch (error) {
      toast.error(error.message || "Failed to load debt types");
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

  const sortedDebtTypes = [...debtTypes].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";

    if (aValue < bValue) return sortDirection == "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const filteredDebtTypes = sortedDebtTypes.filter((debtType) => {
    const matchesSearch =
      debtType.DT_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debtType.DT_Code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debtType.DT_Cate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debtType.DT_Lia_type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !filterStatus ||
      (filterStatus == "active" && debtType.Is_Active) ||
      (filterStatus == "inactive" && !debtType.Is_Active);

    const matchesCategory =
      !filterCategory || debtType.DT_Cate == filterCategory;

    const matchesLiabilityType =
      !filterLiabilityType || debtType.DT_Lia_type == filterLiabilityType;

    return (
      matchesSearch && matchesStatus && matchesCategory && matchesLiabilityType
    );
  });

  const handleDeleteDebtType = async (debtTypeId, debtTypeName) => {
    const result = await Swal.fire({
      title: "Delete Debt Type?",
      text: `Are you sure you want to delete "${debtTypeName}"? This action cannot be undone.`,
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
        await DebtTypeMasterApi.delete(debtTypeId);
        await loadDebtTypes();
        toast.success(`Debt type "${debtTypeName}" deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete debt type");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDebtTypes.length == 0) {
      toast.error("No debt types selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedDebtTypes.length} selected debt types?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedDebtTypes.map((id) =>
          DebtTypeMasterApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadDebtTypes();
        setSelectedDebtTypes([]);
        toast.success(
          `${selectedDebtTypes.length} debt type(s) deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some debt types");
      }
    }
  };

  const stats = {
    totalDebtTypes: pagination.total,
    activeDebtTypes: debtTypes.filter((d) => d.Is_Active).length,
    inactiveDebtTypes: debtTypes.filter((d) => !d.Is_Active).length,
    longTerm: debtTypes.filter((d) => d.DT_Cate == "Long Term").length,
    shortTerm: debtTypes.filter((d) => d.DT_Cate == "Short Term").length,
  };

  const getCategoryBadgeColor = (category) => {
    if (category == "Long Term") return "bg-blue-100 text-blue-800";
    if (category == "Short Term") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const getLiabilityTypeBadgeColor = (type) => {
    if (type == "Payable") return "bg-purple-100 text-purple-800";
    if (type == "Deposit") return "bg-yellow-100 text-yellow-800";
    if (type == "Loan") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
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
            to="/masters/grant-management/debt-type-master/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Debt Type
          </Link>
        </div>
      </div>

      {/* Action Bar - Enhanced */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search debt types by name, code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="Long Term">Long Term</option>
              <option value="Short Term">Short Term</option>
            </select>

            <select
              value={filterLiabilityType}
              onChange={(e) => setFilterLiabilityType(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Liability Types</option>
              <option value="Payable">Payable</option>
              <option value="Deposit">Deposit</option>
              <option value="Loan">Loan</option>
            </select>

            <button
              onClick={loadDebtTypes}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions - Enhanced */}
        {selectedDebtTypes.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedDebtTypes.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedDebtTypes.length} debt type(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected debt types
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedDebtTypes([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedDebtTypes.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Debt Types Table - Enhanced with row click navigation */}
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
                        selectedDebtTypes.length == filteredDebtTypes.length &&
                        filteredDebtTypes.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDebtTypes(
                            filteredDebtTypes.map((d) => d.DT_id),
                          );
                        } else {
                          setSelectedDebtTypes([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("DT_Code")}
                >
                  <div className="flex items-center">
                    Debt Code
                    {sortField == "DT_Code" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("DT_Name")}
                >
                  <div className="flex items-center">
                    Debt Name
                    {sortField == "DT_Name" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th> */}
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
                        Loading debt types...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredDebtTypes.length > 0 ? (
                filteredDebtTypes.map((debtType) => (
                  <tr
                    key={debtType.DT_id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/grant-management/debt-type-master/view/${debtType.DT_id}`,
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
                          checked={selectedDebtTypes.includes(debtType.DT_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDebtTypes([
                                ...selectedDebtTypes,
                                debtType.DT_id,
                              ]);
                            } else {
                              setSelectedDebtTypes(
                                selectedDebtTypes.filter(
                                  (id) => id != debtType.DT_id,
                                ),
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {debtType.DT_Code?.charAt(0) || "D"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-150">
                              {debtType.DT_Code || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-150">
                        {debtType.DT_Name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {debtType.DT_Cate && (
                          <div className="flex items-center">
                            <Scale className="h-3 w-3 text-gray-400 mr-2" />
                            <span className="text-xs">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${getCategoryBadgeColor(debtType.DT_Cate)}`}
                              >
                                {debtType.DT_Cate}
                              </span>
                            </span>
                          </div>
                        )}
                        {debtType.DT_Lia_type && (
                          <div className="flex items-center">
                            <CreditCard className="h-3 w-3 text-gray-400 mr-2" />
                            <span className="text-xs">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${getLiabilityTypeBadgeColor(debtType.DT_Lia_type)}`}
                              >
                                {debtType.DT_Lia_type}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {debtType.Is_Active ? (
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
                    {/* <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(debtType.created_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(debtType.created_at)}
                      </div>
                    </td> */}
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/grant-management/debt-type-master/view/${debtType.DT_id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/grant-management/debt-type-master/edit/${debtType.DT_id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!debtType.deleted_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDebtType(
                                debtType.DT_id,
                                debtType.DT_Name,
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
                        <TrendingDown className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ||
                        filterStatus ||
                        filterCategory ||
                        filterLiabilityType
                          ? "No matching debt types found"
                          : "No debt types found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm ||
                        filterStatus ||
                        filterCategory ||
                        filterLiabilityType
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first debt type"}
                      </p>
                      {!searchTerm &&
                        !filterStatus &&
                        !filterCategory &&
                        !filterLiabilityType && (
                          <Link
                            to="/masters/grant-management/debt-type-master/create"
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Debt Type
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
              debt types
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

export default DebtTypeList;
