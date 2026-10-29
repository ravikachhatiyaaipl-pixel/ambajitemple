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
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Building,
  ArrowLeft,
  Layers,
  Hash,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ChallanVoucherApi } from "../../../services/challanvoucherapi";

const ExpenseChallanVoucherList = ({ user }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [pageTitle, setPageTitle] = useState("Challan Voucher Management");
  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/bookkeeping-vouchers/expense-challan";

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
    loadVouchers();
  }, [currentPage, searchTerm, filterBranch, startDate, endDate]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const result = await ChallanVoucherApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        filterBranch,
        startDate,
        endDate,
        "N",
      );

      setVouchers(result.vouchers || []);
      setTotalPages(result.pagination?.last_page || 1);
      setTotalItems(result.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading challan vouchers:", error);
      toast.error("Failed to load challan vouchers");
      setVouchers([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoucher = async (voucherId, voucherNo) => {
    const result = await Swal.fire({
      title: "Delete Challan Voucher?",
      text: `Are you sure you want to delete voucher "${voucherNo}"? This action cannot be undone.`,
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
      await ChallanVoucherApi.delete(voucherId);
      await loadVouchers();
      toast.success(`Voucher "${voucherNo}" deleted successfully!`);
      setSelectedVouchers(selectedVouchers.filter((id) => id != voucherId));
    } catch (error) {
      console.error("Error deleting challan voucher:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete challan voucher",
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVouchers.length == 0) {
      toast.error("No vouchers selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedVouchers.length} selected vouchers?`,
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
        const deletePromises = selectedVouchers.map((id) =>
          ChallanVoucherApi.delete(id),
        );
        await Promise.all(deletePromises);

        await loadVouchers();
        setSelectedVouchers([]);
        toast.success(
          `${selectedVouchers.length} voucher(s) deleted successfully!`,
        );
      } catch (error) {
        console.error("Error in bulk delete:", error);
        toast.error("Failed to delete some vouchers");
        await loadVouchers();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterBranch("");
    setStartDate("");
    setEndDate("");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const truncateText = (text, length = 50) => {
    if (!text) return "N/A";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  // Get branch display text
  const getBranchDisplay = (voucher) => {
    if (!voucher.department) return "N/A";

    const dept = voucher.department;
    let displayText = dept.Dpt_Desc || "";

    if (dept.Dpt_Name && dept.Dpt_Name != dept.Dpt_Desc) {
      displayText += ` (${dept.Dpt_Name})`;
    }

    return displayText;
  };

  // Get budget head display text
  const getBudgetHeadDisplay = (voucher) => {
    if (!voucher.budget_head) return "N/A";

    const head = voucher.budget_head;
    return head.Gr_Nm || "N/A";
  };

  // Get ledger display text
  const getLedgerDisplay = (voucher) => {
    if (!voucher.ledger) return "N/A";

    const ledger = voucher.ledger;
    let displayText = ledger.Lg_Name || "";

    if (ledger.Lg_Eng_Name && ledger.Lg_Eng_Name != ledger.Lg_Name) {
      displayText += ` (${ledger.Lg_Eng_Name})`;
    }

    if (ledger.Lg_Code) {
      displayText += ` - ${ledger.Lg_Code}`;
    }

    return displayText;
  };

  // Calculate total amount - FIXED: Use details array from API
  const getTotalAmount = (voucher) => {
    if (!voucher.details || !Array.isArray(voucher.details)) return 0;
    return voucher.details.reduce(
      (sum, detail) => sum + (parseFloat(detail.Amount) || 0),
      0,
    );
  };

  // Get item count - FIXED: Use details array
  const getItemCount = (voucher) => {
    return voucher.details?.length || 0;
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
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">
              Manage and track challan vouchers
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadVouchers}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/transactions/bookkeeping-vouchers/expense-challan/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Challan Voucher
          </Link>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by voucher number, remarks..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedVouchers.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {selectedVouchers.length} voucher(s) selected
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={loading}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Deleting..." : "Delete Selected"}
            </button>
            <button
              onClick={() => setSelectedVouchers([])}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={
                      selectedVouchers.length == vouchers.length &&
                      vouchers.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVouchers(vouchers.map((v) => v.CV_Id));
                      } else {
                        setSelectedVouchers([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voucher Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch & Head
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ledger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : vouchers.length > 0 ? (
                vouchers.map((voucher) => (
                  <tr
                    key={voucher.CV_Id}
                    className="hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/transactions/bookkeeping-vouchers/expense-challan/view/${voucher.CV_Id}`,
                        );
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={selectedVouchers.includes(voucher.CV_Id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVouchers([
                              ...selectedVouchers,
                              voucher.CV_Id,
                            ]);
                          } else {
                            setSelectedVouchers(
                              selectedVouchers.filter(
                                (id) => id != voucher.CV_Id,
                              ),
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-sm font-semibold text-gray-900">
                            {voucher.CV_No}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Start: {formatDate(voucher.Ch_Start_Date)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          End: {formatDate(voucher.Ch_End_Date)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getItemCount(voucher)} item(s)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {/* Branch */}
                        <div className="flex items-start">
                          <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-500">Branch</div>
                            <div className="text-sm text-gray-900">
                              {getBranchDisplay(voucher)}
                            </div>
                          </div>
                        </div>

                        {/* Budget Head */}
                        <div className="flex items-start">
                          <Layers className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-500">
                              Budget Head
                            </div>
                            <div className="text-sm text-gray-900">
                              {getBudgetHeadDisplay(voucher)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {/* Ledger */}
                        <div className="flex items-start">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-500">Ledger</div>
                            <div className="text-sm text-gray-900">
                              {getLedgerDisplay(voucher)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                        <div className="text-xs text-green-600">
                          Total Amount
                        </div>
                        <div className="text-lg font-bold text-green-700">
                          {formatCurrency(getTotalAmount(voucher))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 action-buttons">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/transactions/bookkeeping-vouchers/expense-challan/view/${voucher.CV_Id}`}
                          className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/transactions/bookkeeping-vouchers/expense-challan/edit/${voucher.CV_Id}`}
                          className="text-purple-600 hover:text-purple-900 p-1.5 hover:bg-purple-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVoucher(voucher.CV_Id, voucher.CV_No);
                          }}
                          className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded transition-colors"
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
                    <div className="text-gray-500">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium mb-1">
                        No challan vouchers found
                      </p>
                      <p className="text-sm mb-4">
                        {searchTerm || filterBranch || startDate || endDate
                          ? "Try adjusting your search or filters"
                          : "Get started by creating your first challan voucher"}
                      </p>
                      {!searchTerm &&
                        !filterBranch &&
                        !startDate &&
                        !endDate && (
                          <Link
                            to="/transactions/bookkeeping-vouchers/expense-challan/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Voucher
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
        <div className="text-sm text-gray-700">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
          entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage == 1}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1.5 rounded-lg ${
                  currentPage == pageNum
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage == totalPages}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseChallanVoucherList;
