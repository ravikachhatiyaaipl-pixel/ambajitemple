import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Receipt,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Briefcase,
  Hash,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { WorkBgApi } from "../../../services/workbgapi";

const WorkBgList = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageTitle, setPageTitle] = useState("BG Receipt Entry");

  const navigate = useNavigate();

  useEffect(() => {
    // Get page title from menu details
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/tender-management/work-bg-receipt-entry";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }

    loadEntries();
  }, [currentPage, filterStatus]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const result = await WorkBgApi.getAll(
        currentPage,
        itemsPerPage,
        "", // Empty search term
        filterStatus,
        "Receipt",
      );

      setEntries(result.entries || []);
      setTotalPages(result.pagination?.last_page || 1);
      setTotalItems(result.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading BG entries:", error);
      toast.error("Failed to load entries");
      setEntries([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    const result = await Swal.fire({
      title: "Delete BG Entry?",
      text: `Are you sure you want to delete this BG entry? This action cannot be undone.`,
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
      await WorkBgApi.delete(entryId);
      await loadEntries();
      toast.success(`Entry deleted successfully!`);
      setSelectedEntries(selectedEntries.filter((id) => id != entryId));
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error(error.response?.data?.message || "Failed to delete entry");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.length == 0) {
      toast.error("No entries selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedEntries.length} selected entries?`,
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
        const deletePromises = selectedEntries.map((id) =>
          WorkBgApi.delete(id),
        );
        await Promise.all(deletePromises);

        await loadEntries();
        setSelectedEntries([]);
        toast.success(
          `${selectedEntries.length} entry(s) deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some entries");
        await loadEntries();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearFilters = () => {
    setFilterStatus("");
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

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const truncateText = (text, length = 60) => {
    if (!text) return "N/A";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      hod_app: {
        color: "bg-green-100 text-green-800",
        label: "HOD Approved",
        icon: CheckCircle,
      },
      draft: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Draft",
        icon: Clock,
      },
      hod_rej: {
        color: "bg-red-100 text-red-800",
        label: "HOD Rejected",
        icon: XCircle,
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getBgTypeBadge = (type) => {
    const typeConfig = {
      Receipt: { color: "bg-blue-100 text-blue-800", icon: CreditCard },
      Release: { color: "bg-green-100 text-green-800", icon: Clock },
      Adjust: { color: "bg-yellow-100 text-yellow-800", icon: FileText },
      Forefeight: { color: "bg-red-100 text-red-800", icon: AlertCircle },
    };

    const config = typeConfig[type] || {
      color: "bg-gray-100 text-gray-800",
      icon: Receipt,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {type}
      </span>
    );
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
            <p className="text-gray-600 mt-1">Manage BG receipt entries</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadEntries}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/transactions/tender-management/work-bg-receipt-entry/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New BG Entry
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Status Filter */}
          <div className="w-full md:w-64">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="hod_app">HOD Approved</option>
              <option value="hod_rej">HOD Rejected</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {filterStatus && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedEntries.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedEntries.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedEntries.length} entry(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected entries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedEntries([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Entries Table */}
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
                      selectedEntries.length == entries.length &&
                      entries.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEntries(entries.map((e) => e.WBT_Id));
                      } else {
                        setSelectedEntries([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date & Bill No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  BG Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Work Allocation Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  BG Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : entries.length > 0 ? (
                entries.map((entry) => {
                  const workAllocation = entry.work_allocation;
                  const noc = entry.noc;
                  const vendor = entry.subledger;

                  return (
                    <tr
                      key={entry.WBT_Id}
                      className="hover:bg-gray-50 transition-colors group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/transactions/tender-management/work-bg-receipt-entry/view/${entry.WBT_Id}`,
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
                          checked={selectedEntries.includes(entry.WBT_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntries([
                                ...selectedEntries,
                                entry.WBT_Id,
                              ]);
                            } else {
                              setSelectedEntries(
                                selectedEntries.filter(
                                  (id) => id != entry.WBT_Id,
                                ),
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(entry.WBT_Date)}
                            </div>
                            {entry.WBT_BillNo && (
                              <div className="text-xs text-gray-500">
                                Bill: {entry.WBT_BillNo}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getBgTypeBadge(entry.WBT_Type)}
                      </td>
                      <td className="px-6 py-4">
                        {workAllocation ? (
                          <div className="max-w-xs">
                            {/* Reference ID */}
                            {workAllocation.WA_RefId && (
                              <div className="flex items-center text-xs text-gray-500 mb-1">
                                <Hash className="h-3 w-3 mr-1" />
                                Ref: {workAllocation.WA_RefId}
                              </div>
                            )}

                            {/* Tender Description */}
                            {workAllocation.tender && (
                              <div
                                className="text-sm font-medium text-gray-900 mb-1"
                                title={workAllocation.tender.Description}
                              >
                                {truncateText(
                                  workAllocation.tender.Description,
                                  40,
                                )}
                              </div>
                            )}

                            {/* Work Order Amount */}
                            <div className="text-xs text-gray-600">
                              WO Amt: {formatCurrency(workAllocation.WO_Amount)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            WA #{entry.WA_Id}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {vendor ? (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-900">
                              {vendor.SL_Name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            SL #{entry.SL_Id}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-blue-600">
                          {formatCurrency(entry.BG_Amt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {getStatusBadge(entry.Status)}
                          {entry.Status == "hod_rej" && entry.Remarks && (
                            <div
                              className="text-xs text-red-500 mt-1 max-w-[150px] truncate"
                              title={entry.Remarks}
                            >
                              Reason: {truncateText(entry.Remarks, 20)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/transactions/tender-management/work-bg-receipt-entry/view/${entry.WBT_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/transactions/tender-management/work-bg-receipt-entry/edit/${entry.WBT_Id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEntry(entry.WBT_Id);
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
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        No BG entries found
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        {filterStatus
                          ? "Try adjusting your filters"
                          : "Get started by creating your first BG entry"}
                      </p>
                      {!filterStatus && (
                        <Link
                          to="/transactions/tender-management/work-bg-receipt-entry/create"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Entry
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
      {entries.length > 0 && (
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
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
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
      )}
    </div>
  );
};

export default WorkBgList;
