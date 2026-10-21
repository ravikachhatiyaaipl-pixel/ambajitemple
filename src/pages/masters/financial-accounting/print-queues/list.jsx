import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Printer,
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
  Clock,
  AlertCircle,
  Calendar,
  TrendingUp,
  User,
  IndianRupee,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { PrintQueuesApi } from "../../../services/printqueuesapi";
import debounce from "lodash/debounce";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const PrintQueuesList = ({ user }) => {
  const [printQueues, setPrintQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedQueues, setSelectedQueues] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Print Queue Management");
  const [statusFilter, setStatusFilter] = useState("");
  const [chequeDetailsMap, setChequeDetailsMap] = useState({});

  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/financial-accounting/print-queues";

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

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSearchDebounced("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  // Fetch cheque details for a specific cheque ID
  const fetchChequeDetails = async (chequeId) => {
    if (chequeDetailsMap[chequeId]) return chequeDetailsMap[chequeId];

    try {
      const response = await axios.get(`${API_BASE_URL}/cheques/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (response.data.success) {
        const cheque = response.data.data.find((c) => c.cheque_id == chequeId);
        if (cheque) {
          setChequeDetailsMap((prev) => ({ ...prev, [chequeId]: cheque }));
          return cheque;
        }
      }
    } catch (error) {
      console.error("Error fetching cheque details:", error);
    }
    return null;
  };

  // Load print queues when page, search, or status filter changes
  useEffect(() => {
    loadPrintQueues();
  }, [currentPage, searchDebounced, statusFilter]);

  const loadPrintQueues = async () => {
    setLoading(true);
    try {
      const result = await PrintQueuesApi.getAllPrintQueues(
        currentPage,
        itemsPerPage,
        searchDebounced,
        statusFilter,
      );

      setPrintQueues(result.printQueues || []);
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

      // Fetch cheque details for all queues
      if (result.printQueues && result.printQueues.length > 0) {
        result.printQueues.forEach((queue) => {
          if (queue.cheque_id) {
            fetchChequeDetails(queue.cheque_id);
          }
        });
      }
    } catch (error) {
      console.error("Error loading print queues:", error);
      toast.error(
        error.response?.data?.message || "Failed to load print queues",
      );
      setPrintQueues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQueue = async (queueId, chequeId) => {
    const result = await Swal.fire({
      title: "Delete Print Queue?",
      text: `Are you sure you want to delete print queue for Cheque #${chequeId}? This action cannot be undone.`,
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
      await PrintQueuesApi.delete(queueId);
      toast.success(
        `Print queue for Cheque #${chequeId} deleted successfully!`,
      );
      await loadPrintQueues();
      setSelectedQueues(selectedQueues.filter((id) => id != queueId));
    } catch (error) {
      console.error("Error deleting print queue:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete print queue",
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQueues.length == 0) {
      toast.error("No print queues selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedQueues.length} selected print queue(s)?`,
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
        const deletePromises = selectedQueues.map((id) =>
          PrintQueuesApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadPrintQueues();
        setSelectedQueues([]);
        toast.success(
          `${selectedQueues.length} print queue(s) deleted successfully!`,
        );
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Failed to delete some print queues");
        await loadPrintQueues();
      } finally {
        setLoading(false);
      }
    }
  };

  // Stats calculation
  const stats = {
    totalQueues: pagination.total,
    pendingQueues: printQueues.filter((q) => !q.printed_at).length,
    printedQueues: printQueues.filter((q) => q.printed_at).length,
    highPriorityQueues: printQueues.filter((q) => q.priority <= 3).length,
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getPriorityBadge = (priority) => {
    if (priority <= 2) {
      return {
        color: "bg-red-100 text-red-800",
        label: "High",
        icon: AlertCircle,
      };
    } else if (priority <= 4) {
      return {
        color: "bg-yellow-100 text-yellow-800",
        label: "Medium",
        icon: Clock,
      };
    } else {
      return {
        color: "bg-green-100 text-green-800",
        label: "Low",
        icon: CheckCircle,
      };
    }
  };

  const getStatusBadge = (printedAt) => {
    if (printedAt) {
      return {
        color: "bg-green-100 text-green-800",
        label: "Printed",
        icon: CheckCircle,
      };
    } else {
      return {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending",
        icon: Clock,
      };
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

  const hasActiveFilters = searchTerm != "" || statusFilter != "";

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedQueues(printQueues.map((q) => q.print_queues_id));
    } else {
      setSelectedQueues([]);
    }
  };

  const handleSelectQueue = (queueId, checked) => {
    if (checked) {
      setSelectedQueues([...selectedQueues, queueId]);
    } else {
      setSelectedQueues(selectedQueues.filter((id) => id != queueId));
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
              Manage cheque print queues for financial accounting
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/financial-accounting/print-queues/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add to Queue
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
              placeholder="Search by Cheque ID, Payee Name, Cheque Number..."
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
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="printed">Printed</option>
            </select>

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
              onClick={loadPrintQueues}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {selectedQueues.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedQueues.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedQueues.length} queue(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected queues
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedQueues([])}
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

      {/* Print Queues Table */}
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
                      printQueues.length > 0 &&
                      selectedQueues.length == printQueues.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Cheque Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Queue Information
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status & Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading print queues...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : printQueues.length > 0 ? (
                printQueues.map((queue) => {
                  const priorityBadge = getPriorityBadge(queue.priority);
                  const statusBadge = getStatusBadge(queue.printed_at);
                  const PriorityIcon = priorityBadge.icon;
                  const StatusIcon = statusBadge.icon;
                  const chequeDetails = chequeDetailsMap[queue.cheque_id];

                  return (
                    <tr
                      key={queue.print_queues_id}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/masters/financial-accounting/print-queues/view/${queue.print_queues_id}`,
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
                          checked={selectedQueues.includes(
                            queue.print_queues_id,
                          )}
                          onChange={(e) =>
                            handleSelectQueue(
                              queue.print_queues_id,
                              e.target.checked,
                            )
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-sm">
                              {chequeDetails?.SL_Name?.charAt(0) || "CQ"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {chequeDetails?.SL_Name ||
                                `Cheque #${queue.cheque_id}`}
                            </div>
                            <div className="flex items-center flex-wrap gap-2 mt-1">
                              {chequeDetails?.cheque_number && (
                                <span className="text-xs text-gray-400">
                                  {chequeDetails.cheque_number}
                                </span>
                              )}
                              {chequeDetails?.amount && (
                                <span className="text-xs font-medium text-green-600">
                                  • {formatCurrency(chequeDetails.amount)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            Queued: {formatDateTime(queue.queued_at)}
                          </div>
                          {queue.printed_at && (
                            <div className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                              Printed: {formatDateTime(queue.printed_at)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusBadge.label}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ml-2 ${priorityBadge.color}`}
                          >
                            <PriorityIcon className="h-3 w-3 mr-1" />
                            Priority: {queue.priority}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/financial-accounting/print-queues/view/${queue.print_queues_id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/financial-accounting/print-queues/edit/${queue.print_queues_id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQueue(
                                queue.print_queues_id,
                                queue.cheque_id,
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
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Printer className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {hasActiveFilters
                          ? "No matching print queues found"
                          : "No print queues found"}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first print queue"}
                      </p>
                      {!hasActiveFilters && (
                        <Link
                          to="/masters/financial-accounting/print-queues/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Queue
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

export default PrintQueuesList;
