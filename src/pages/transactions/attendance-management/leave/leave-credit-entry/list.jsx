// leave-credits/list.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LeaveCreditsApi } from "../../../../services/leavecreditsapi";

const LeaveTransactionList = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [financialYears, setFinancialYears] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageTitle, setPageTitle] = useState("Leave Credit");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/attendance-management/leave/leave-credits";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }

    loadFinancialYears();
    loadEntries();
  }, [currentPage, searchTerm, selectedFinancialYear]);

  const loadFinancialYears = async () => {
    try {
      const result = await LeaveCreditsApi.getFinancialYears();
      if (result.success && result.data) {
        setFinancialYears(result.data);
      }
    } catch (error) {
      console.error("Error loading financial years:", error);
    }
  };

  const loadEntries = async () => {
    setLoading(true);
    try {
      const result = await LeaveCreditsApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        selectedFinancialYear,
      );
      setEntries(result.entries || []);
      setTotalPages(result.pagination?.last_page || 1);
      setTotalItems(result.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading leave credit:", error);
      toast.error("Failed to load leave credit");
      setEntries([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entry) => {
    const result = await Swal.fire({
      title: "Delete Leave Credit?",
      text: `Are you sure you want to delete this leave transaction? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await LeaveCreditsApi.delete(entry.LTr_id);
      await loadEntries();
      toast.success("Leave transaction deleted successfully!");
      setSelectedEntries(selectedEntries.filter((id) => id != entry.LTr_id));
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(error.response?.data?.message || "Failed to delete");
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
          LeaveCreditsApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadEntries();
        setSelectedEntries([]);
        toast.success(
          `${selectedEntries.length} entry(ies) deleted successfully!`,
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
    setSearchTerm("");
    setSelectedFinancialYear("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      ACCRUAL: "Accrual",
      OPENING_CREDIT: "Opening Credit",
      CARRY_FORWARD: "Carry Forward",
      DEBIT_APPLIED: "Debit Applied",
      CREDIT_CANCELLED: "Credit Cancelled",
      ENCASHMENT: "Encashment",
      LAPSE: "Lapse",
      MANUAL_ADJUSTMENT: "Manual Adjustment",
    };
    return labels[type] || type;
  };

  const getTrModeBadge = (mode) => {
    if (mode == "C") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Credit (+)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Debit (-)
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
            <p className="text-gray-600 mt-1">Manage employee leave credit</p>
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
            to="/transactions/attendance-management/leave/leave-credits/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name, leave type, transaction type..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Financial Year Dropdown */}
          <div className="w-full md:w-64">
            <select
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedFinancialYear}
              onChange={(e) => {
                setSelectedFinancialYear(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Financial Years</option>
              {financialYears.map((fy) => (
                <option key={fy.FY_Id} value={fy.FY_Id}>
                  {fy.FY_Name || fy.FY_Code}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedFinancialYear) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>

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
                  {selectedEntries.length} entry(ies) selected
                </span>
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
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
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
                        setSelectedEntries(entries.map((e) => e.LTr_id));
                      } else {
                        setSelectedEntries([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Transaction Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Transaction Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Financial Year
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
                entries.map((entry) => (
                  <tr
                    key={entry.LTr_id}
                    className="hover:bg-gray-50 transition-colors group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/transactions/attendance-management/leave/leave-credits/view/${entry.LTr_id}`,
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
                        checked={selectedEntries.includes(entry.LTr_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEntries([
                              ...selectedEntries,
                              entry.LTr_id,
                            ]);
                          } else {
                            setSelectedEntries(
                              selectedEntries.filter(
                                (id) => id != entry.LTr_id,
                              ),
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.employee?.First_Name}{" "}
                            {entry.employee?.Last_Name || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.leave_type?.LT_name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getTransactionTypeLabel(entry.Tr_Type)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-gray-900">
                          {formatDate(entry.Tr_Date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-blue-600">
                        {entry.Tr_Days} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getTrModeBadge(entry.Tr_Mode)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {entry.financial_year?.FY_Name || entry.financial_year?.FY_Code || "N/A"}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/transactions/attendance-management/leave/leave-credits/view/${entry.LTr_id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteEntry(entry)}
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
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        No leave credit found
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchTerm || selectedFinancialYear
                          ? "Try adjusting your search or filter"
                          : "Get started by creating your first leave transaction"}
                      </p>
                      {!searchTerm && !selectedFinancialYear && (
                        <Link
                          to="/transactions/attendance-management/leave/leave-credits/create"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Transaction
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
              <ChevronLeft className="h-4 w-4" />
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
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTransactionList;