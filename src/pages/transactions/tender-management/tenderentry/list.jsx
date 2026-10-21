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
  Filter,
  Layers,
  Hash,
  Calendar,
  Percent,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { TenderEntryApi } from "../../../services/tenderentryapi";

const TenderEntryList = ({ user }) => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedTenders, setSelectedTenders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [pageTitle, setPageTitle] = useState("Tender Entry Management");
  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/tender-management/tenderentry";

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
    loadTenders();
  }, [currentPage, searchTerm, filterBranch, startDate, endDate]);

  const loadTenders = async () => {
    setLoading(true);
    try {
      const result = await TenderEntryApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        filterBranch,
        startDate,
        endDate,
      );

      setTenders(result.tenders || []);
      setTotalPages(result.pagination?.last_page || 1);
      setTotalItems(result.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading tender entries:", error);
      toast.error("Failed to load tender entries");
      setTenders([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTender = async (tenderId) => {
    const result = await Swal.fire({
      title: "Delete Tender Entry?",
      text: `Are you sure you want to delete this tender entry? This action cannot be undone.`,
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
      await TenderEntryApi.delete(tenderId);
      await loadTenders();
      toast.success(`Tender entry deleted successfully!`);
      setSelectedTenders(selectedTenders.filter((id) => id != tenderId));
    } catch (error) {
      console.error("Error deleting tender entry:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete tender entry",
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTenders.length == 0) {
      toast.error("No tender entries selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedTenders.length} selected tender entries?`,
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
        const deletePromises = selectedTenders.map((id) =>
          TenderEntryApi.delete(id),
        );
        await Promise.all(deletePromises);

        await loadTenders();
        setSelectedTenders([]);
        toast.success(
          `${selectedTenders.length} tender entry(s) deleted successfully!`,
        );
      } catch (error) {
        console.error("Error in bulk delete:", error);
        toast.error("Failed to delete some tender entries");
        await loadTenders();
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

  const truncateText = (text, length = 80) => {
    if (!text) return "N/A";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  // Get branch display text (Dpt_Desc first, then Dpt_Name if available)
  const getBranchDisplay = (department) => {
    if (!department) return "N/A";

    let displayText = department.Dpt_Desc || "";

    if (department.Dpt_Name && department.Dpt_Name != department.Dpt_Desc) {
      displayText += ` (${department.Dpt_Name})`;
    }

    return displayText;
  };

  // Get budget head display text
  const getBudgetHeadDisplay = (budgetHead) => {
    if (!budgetHead) return "N/A";

    let displayText = budgetHead.Gr_Nm || "";

    return displayText;
  };

  // Get ledger display text (Lg_Name first, then Lg_Eng_Name and Lg_Code)
  const getLedgerDisplay = (ledger) => {
    if (!ledger) return "N/A";

    let displayText = ledger.Lg_Name || "";

    if (ledger.Lg_Eng_Name && ledger.Lg_Eng_Name != ledger.Lg_Name) {
      displayText += ` (${ledger.Lg_Eng_Name})`;
    }

    if (ledger.Lg_Code) {
      displayText += ` - ${ledger.Lg_Code}`;
    }

    return displayText;
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
              Manage and track tender entries
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadTenders}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/transactions/tender-management/tenderentry/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Tender Entry
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
              placeholder="Search by tender description..."
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
        {selectedTenders.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {selectedTenders.length} tender(s) selected
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={loading}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Deleting..." : "Delete Selected"}
            </button>
            <button
              onClick={() => setSelectedTenders([])}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Tenders Table */}
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
                      selectedTenders.length == tenders.length &&
                      tenders.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTenders(tenders.map((t) => t.TE_Id));
                      } else {
                        setSelectedTenders([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tender Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch & Budget Head
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ledger & Financials
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Additional Info
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
              ) : tenders.length > 0 ? (
                tenders.map((tender) => (
                  <tr
                    key={tender.TE_Id}
                    className="hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/transactions/tender-management/tenderentry/view/${tender.TE_Id}`,
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
                        checked={selectedTenders.includes(tender.TE_Id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTenders([
                              ...selectedTenders,
                              tender.TE_Id,
                            ]);
                          } else {
                            setSelectedTenders(
                              selectedTenders.filter(
                                (id) => id != tender.TE_Id,
                              ),
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-xs text-gray-500 flex items-center mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span className="font-medium">Start Date:</span>{" "}
                          {formatDate(tender.TE_St_Date)}
                        </div>
                        {tender.TE_Ed_Date && (
                          <div className="text-xs text-gray-500 flex items-center mb-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="font-medium">End Date:</span>{" "}
                            {formatDate(tender.TE_Ed_Date)}
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {truncateText(tender.Description)}
                        </div>
                        {tender.tendertype && (
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Work Type:</span>{" "}
                            {tender.tendertype.TnT_Name}
                            {tender.tendertype.TnT_Code && (
                              <span className="ml-1 text-gray-400">
                                ({tender.tendertype.TnT_Code})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-3">
                        {/* Branch Details */}
                        {tender.department && (
                          <div className="flex items-start">
                            <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs text-gray-500">
                                Branch
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {getBranchDisplay(tender.department)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Budget Head Details */}
                        {tender.budget_head && (
                          <div className="flex items-start">
                            <Layers className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs text-gray-500">
                                Budget Head
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {getBudgetHeadDisplay(tender.budget_head)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-3">
                        {/* Ledger Details */}
                        {tender.ledger ? (
                          <div className="flex items-start">
                            <div>
                              <div className="text-xs text-gray-500">
                                Ledger
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {getLedgerDisplay(tender.ledger)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic">
                            No ledger assigned
                          </div>
                        )}

                        {/* Financial Details */}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-blue-50 p-2 rounded">
                            <div className="text-xs text-blue-600">
                              Proposal
                            </div>
                            <div className="text-sm font-semibold text-blue-700">
                              {formatCurrency(tender.Proposal_Amount || 0)}
                            </div>
                          </div>
                          {tender.Approved_Amount && (
                            <div className="bg-green-50 p-2 rounded">
                              <div className="text-xs text-green-600">
                                Approved
                              </div>
                              <div className="text-sm font-semibold text-green-700">
                                {formatCurrency(tender.Approved_Amount)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {/* BG Percentage */}
                        {tender.BG_Per && (
                          <div className="flex items-center">
                            <Percent className="h-3 w-3 text-purple-500 mr-1" />
                            <span className="text-xs">
                              <span className="font-medium text-gray-500">
                                BG:
                              </span>{" "}
                              <span className="text-gray-900">
                                {tender.BG_Per}%
                              </span>
                            </span>
                          </div>
                        )}

                        {/* EMD Percentage */}
                        {tender.EMD_Per && (
                          <div className="flex items-center">
                            <Percent className="h-3 w-3 text-orange-500 mr-1" />
                            <span className="text-xs">
                              <span className="font-medium text-gray-500">
                                EMD:
                              </span>{" "}
                              <span className="text-gray-900">
                                {tender.EMD_Per}%
                              </span>
                            </span>
                          </div>
                        )}

                        {/* Tender Fee */}
                        {tender.TE_Fee && (
                          <div className="flex items-center">
                            <CreditCard className="h-3 w-3 text-teal-500 mr-1" />
                            <span className="text-xs">
                              <span className="font-medium text-gray-500">
                                Fee:
                              </span>{" "}
                              <span className="text-gray-900">
                                {formatCurrency(tender.TE_Fee)}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 action-buttons">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/transactions/tender-management/tenderentry/view/${tender.TE_Id}`}
                          className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/transactions/tender-management/tenderentry/edit/${tender.TE_Id}`}
                          className="text-purple-600 hover:text-purple-900 p-1.5 hover:bg-purple-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTender(tender.TE_Id);
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
                        No tender entries found
                      </p>
                      <p className="text-sm mb-4">
                        {searchTerm || filterBranch || startDate || endDate
                          ? "Try adjusting your search or filters"
                          : "Get started by creating your first tender entry"}
                      </p>
                      {!searchTerm &&
                        !filterBranch &&
                        !startDate &&
                        !endDate && (
                          <Link
                            to="/transactions/tender-management/tenderentry/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Tender
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

export default TenderEntryList;
