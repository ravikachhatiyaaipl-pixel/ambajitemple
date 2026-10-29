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
  Calculator,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Percent,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Calendar,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { TaxSlabApi } from "../../../services/taxslabmasterapi";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const TaxSlabList = ({ user }) => {
  const [taxSlabs, setTaxSlabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTaxSlabs, setSelectedTaxSlabs] = useState([]);
  const [sortField, setSortField] = useState("FY_ID");
  const [sortDirection, setSortDirection] = useState("asc");
  const [financialYears, setFinancialYears] = useState({});
  const [loadingFY, setLoadingFY] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Tax Slab Master");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]"
      );
      const currentPath = "/masters/administrative-masters/tax-slab";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath
      );

      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  useEffect(() => {
    loadFinancialYears();
  }, []);

  useEffect(() => {
    loadTaxSlabs();
  }, [currentPage, searchTerm]);

  const loadFinancialYears = async () => {
    setLoadingFY(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/fy-master`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );
      const fyMap = {};
      (response.data.data || []).forEach((fy) => {
        fyMap[fy.FY_Id] = fy;
      });
      setFinancialYears(fyMap);
    } catch (error) {
      console.error("Failed to load financial years:", error);
    } finally {
      setLoadingFY(false);
    }
  };

  const loadTaxSlabs = async () => {
    setLoading(true);
    try {
      const result = await TaxSlabApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      console.log("Full API Response:", result);

      setTaxSlabs(result.data);

      // FIX: Use result.meta instead of result.pagination
      if (result.meta) {
        setPagination(result.meta);
      }
      // Fallback
      else {
        setPagination({
          current_page: currentPage,
          last_page: Math.ceil((result.data?.length || 0) / itemsPerPage),
          per_page: itemsPerPage,
          total: result.data?.length || 0,
          from: result.data?.length > 0 ? 1 : 0,
          to: result.data?.length || 0,
        });
      }

      setSelectedTaxSlabs([]);
    } catch (error) {
      toast.error(error.message || "Failed to load tax slabs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

 
  // Add this to debug page changes
  useEffect(() => {
    console.log("Current page changed to:", currentPage);
  }, [currentPage]);
  
  useEffect(() => {
    console.log("Search term changed to:", searchTerm);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm]);
  
  useEffect(() => {
    if (currentPage) {
      loadTaxSlabs();
    }
  }, [currentPage, searchTerm]);

  const handleSort = (field) => {
    if (sortField == field) {
      setSortDirection(sortDirection == "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTaxSlabs = [...taxSlabs].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (
      sortField == "From_Amt" ||
      sortField == "To_Amt" ||
      sortField == "TaxRate"
    ) {
      const aNum = aVal || 0;
      const bNum = bVal || 0;
      return sortDirection == "asc" ? aNum - bNum : bNum - aNum;
    }

    if (aVal < bVal) return sortDirection == "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const handleDeleteTaxSlab = async (taxSlabId, taxName, fromAmt, toAmt) => {
    const result = await Swal.fire({
      title: "Delete Tax Slab?",
      text: `Are you sure you want to delete ${taxName} slab (${formatCurrency(
        fromAmt
      )} - ${formatCurrency(toAmt)})? This action cannot be undone.`,
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
        await TaxSlabApi.delete(taxSlabId);
        await loadTaxSlabs();
        toast.success(`Tax slab deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete tax slab");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTaxSlabs.length == 0) {
      toast.error("No tax slabs selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedTaxSlabs.length} selected tax slabs?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedTaxSlabs.map((id) =>
          TaxSlabApi.delete(id)
        );
        await Promise.all(deletePromises);
        await loadTaxSlabs();
        setSelectedTaxSlabs([]);
        toast.success(
          `${selectedTaxSlabs.length} tax slabs deleted successfully!`
        );
      } catch (error) {
        toast.error("Failed to delete some tax slabs");
      }
    }
  };

  const formatCurrency = (value) => {
    if (value == null || value == undefined) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (value == null || value == undefined) return "—";
    return `${value}%`;
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

  const getFinancialYearDisplay = (fyId) => {
    const fy = financialYears[fyId];
    if (!fy) return `FY ${fyId}`;
    return fy.FY_Name || fy.FY_Code || `FY ${fyId}`;
  };

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
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/administrative-masters/tax-slab/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Tax Slab
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
              placeholder="Search tax slabs by name, amount or tax rate..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
                loadTaxSlabs();
              }}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedTaxSlabs.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedTaxSlabs.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">
                  {selectedTaxSlabs.length} tax slab(s) selected
                </span>
                <p className="text-xs text-purple-600">
                  Choose an action for selected slabs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedTaxSlabs([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedTaxSlabs.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tax Slabs Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-offset-0"
                      checked={
                        selectedTaxSlabs.length == taxSlabs.length &&
                        taxSlabs.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTaxSlabs(taxSlabs.map((c) => c.TSL_Id));
                        } else {
                          setSelectedTaxSlabs([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Tax_Name")}
                >
                  <div className="flex items-center">
                    Tax Name
                    {sortField == "Tax_Name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("FY_ID")}
                >
                  <div className="flex items-center">
                    Financial Year
                    {sortField == "FY_ID" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("From_Amt")}
                >
                  <div className="flex items-center">
                    From Amount
                    {sortField == "From_Amt" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("To_Amt")}
                >
                  <div className="flex items-center">
                    To Amount
                    {sortField == "To_Amt" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("TaxRate")}
                >
                  <div className="flex items-center">
                    Tax Rate
                    {sortField == "TaxRate" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
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
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">Loading tax slabs...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedTaxSlabs.length > 0 ? (
                sortedTaxSlabs.map((taxSlab) => (
                  <tr
                    key={taxSlab.TSL_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/masters/administrative-masters/tax-slab/view/${taxSlab.TSL_Id}`
                      )
                    }
                  >
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-offset-0"
                          checked={selectedTaxSlabs.includes(taxSlab.TSL_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTaxSlabs([
                                ...selectedTaxSlabs,
                                taxSlab.TSL_Id,
                              ]);
                            } else {
                              setSelectedTaxSlabs(
                                selectedTaxSlabs.filter(
                                  (id) => id != taxSlab.TSL_Id
                                )
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-400 mr-2" />
                        {taxSlab.Tax_Name ? (
                          <span className="text-sm font-medium text-gray-900">
                            {taxSlab.Tax_Name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Not set
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {getFinancialYearDisplay(taxSlab.FY_ID)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(taxSlab.From_Amt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <IndianRupee className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(taxSlab.To_Amt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-2">
                          <Percent className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-bold text-purple-700">
                          {formatPercentage(taxSlab.TaxRate)}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/administrative-masters/tax-slab/view/${taxSlab.TSL_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/administrative-masters/tax-slab/edit/${taxSlab.TSL_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!taxSlab.deleted_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTaxSlab(
                                taxSlab.TSL_Id,
                                taxSlab.Tax_Name,
                                taxSlab.From_Amt,
                                taxSlab.To_Amt
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Calculator className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No matching tax slabs found"
                          : "No tax slabs found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding your first tax slab"}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/administrative-masters/tax-slab/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Tax Slab
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

      {/* pagination  */}
      {(pagination.last_page > 0) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
              tax slabs
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
                  Math.min(pagination.last_page, prev + 1)
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

export default TaxSlabList;
