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
  Hash,
  Copy,
  Building2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Folder,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { PayrollBillApi } from "../../../services/payrollbillapi";

const PayrollBillList = ({ user }) => {
  const [payrollBills, setPayrollBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedPayrollBills, setSelectedPayrollBills] = useState([]);
  const [sortField, setSortField] = useState("PayBill_Code");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Payroll Bill Master");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/administrative-masters/paybill-master";
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
    loadPayrollBills();
  }, [currentPage, searchTerm]);

  const loadPayrollBills = async () => {
    setLoading(true);
    try {
      const result = await PayrollBillApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      setPayrollBills(result.data);
      setPagination(result.pagination);
      setSelectedPayrollBills([]);
    } catch (error) {
      toast.error(error.message || "Failed to load payroll bills");
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

  const sortedPayrollBills = [...payrollBills].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal == "number" && typeof bVal == "number") {
      return sortDirection == "asc" ? aVal - bVal : bVal - aVal;
    }

    if (aVal < bVal) return sortDirection == "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const handleDeletePayrollBill = async (payrollBillId, payrollBillCode) => {
    const result = await Swal.fire({
      title: "Delete Payroll Bill?",
      text: `Are you sure you want to delete "${payrollBillCode}"? This action cannot be undone.`,
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
        await PayrollBillApi.delete(payrollBillId);
        await loadPayrollBills();
        toast.success(
          `Payroll Bill "${payrollBillCode}" deleted successfully!`,
        );
      } catch (error) {
        toast.error(error.message || "Failed to delete payroll bill");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPayrollBills.length == 0) {
      toast.error("No payroll bills selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedPayrollBills.length} selected payroll bills?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedPayrollBills.map((id) =>
          PayrollBillApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadPayrollBills();
        setSelectedPayrollBills([]);
        toast.success(
          `${selectedPayrollBills.length} payroll bills deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some payroll bills");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
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
            to="/masters/administrative-masters/paybill-master/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Payroll Bill
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
              placeholder="Search payroll bills by code or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                loadPayrollBills();
              }}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedPayrollBills.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedPayrollBills.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedPayrollBills.length} payroll bill(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected bills
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedPayrollBills([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedPayrollBills.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payroll Bills Table */}
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
                        selectedPayrollBills.length == payrollBills.length &&
                        payrollBills.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPayrollBills(
                            payrollBills.map((c) => c.PRB_id),
                          );
                        } else {
                          setSelectedPayrollBills([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("PayBill_Code")}
                >
                  <div className="flex items-center">
                    PayBill Code
                    {sortField == "PayBill_Code" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Description")}
                >
                  <div className="flex items-center">
                    Description
                    {sortField == "Description" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ledger
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading payroll bills...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : sortedPayrollBills.length > 0 ? (
                sortedPayrollBills.map((payrollBill) => (
                  <tr
                    key={payrollBill.PRB_id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/administrative-masters/paybill-master/view/${payrollBill.PRB_id}`,
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
                          checked={selectedPayrollBills.includes(
                            payrollBill.PRB_id,
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPayrollBills([
                                ...selectedPayrollBills,
                                payrollBill.PRB_id,
                              ]);
                            } else {
                              setSelectedPayrollBills(
                                selectedPayrollBills.filter(
                                  (id) => id != payrollBill.PRB_id,
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
                            {payrollBill.PayBill_Code?.charAt(0) || "P"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <Hash className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-150">
                              {payrollBill.PayBill_Code}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyToClipboard(payrollBill.PayBill_Code);
                          }}
                          className="ml-2 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="Copy code"
                        >
                          <Copy className="h-3 w-3 text-gray-400 hover:text-blue-600" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {payrollBill.Description || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {payrollBill.ledger ? (
                        <div className="flex items-center">
                          <Folder className="h-3 w-3 text-gray-400 mr-1" />
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {payrollBill.ledger.Lg_Name}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/administrative-masters/paybill-master/view/${payrollBill.PRB_id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/administrative-masters/paybill-master/edit/${payrollBill.PRB_id}`}
                          className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePayrollBill(
                              payrollBill.PRB_id,
                              payrollBill.PayBill_Code,
                            );
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
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
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No matching payroll bills found"
                          : "No payroll bills found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding your first payroll bill"}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/administrative-masters/paybill-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Payroll Bill
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
              payroll bills
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

export default PayrollBillList;
