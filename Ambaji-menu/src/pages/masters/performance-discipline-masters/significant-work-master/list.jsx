import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Briefcase,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  DollarSign,
  RotateCcw,
  Filter,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import SigniWorkApi from "../../../services/signiworkapi";
import debounce from "lodash/debounce";

const SigniWorkList = ({ user }) => {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [sortField, setSortField] = useState("SWrk_Name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Pagination meta data
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
    from: 0,
    to: 0,
  });

  const [pageTitle, setPageTitle] = useState("Significant Work Master");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [filterFees, setFilterFees] = useState("all"); // all, with_fees, without_fees
  const [filterReimburse, setFilterReimburse] = useState("all"); // all, reimbursable, non_reimbursable
  const [showFilters, setShowFilters] = useState(false);

  // Set page title from menu
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/masters/performance-discipline-masters/significant-work-master";
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

  // Load data whenever dependencies change
  useEffect(() => {
    loadWorks();
  }, [
    currentPage,
    searchTerm,
    sortField,
    sortDirection,
    filterStatus,
    filterFees,
    filterReimburse,
  ]);

  // Debounced search to avoid too many API calls
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
  }, 500);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const loadWorks = async () => {
    setLoading(true);
    try {
      // Build filter parameters
      const params = {
        page: currentPage,
        perPage: itemsPerPage,
        search: searchTerm,
      };

      // Add filter parameters if not "all"
      if (filterStatus != "all") {
        params.is_active = filterStatus == "active" ? 1 : 0;
      }

      if (filterFees != "all") {
        params.has_fees = filterFees == "with_fees" ? 1 : 0;
      }

      if (filterReimburse != "all") {
        params.is_reimbursable = filterReimburse == "reimbursable" ? 1 : 0;
      }

      // Add sorting
      if (sortField) {
        params.sort_by = sortField;
        params.sort_direction = sortDirection;
      }

      const response = await SigniWorkApi.getAll(params);

      setWorks(response.data || []);
      setPaginationMeta(response.meta);
    } catch (error) {
      toast.error("Failed to load significant work");
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
    setCurrentPage(1);
  };

  const handleDelete = async (id, workName) => {
    const result = await Swal.fire({
      title: "Delete Significant Work?",
      text: `Are you sure you want to delete "${workName}"? This action cannot be undone.`,
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
        await SigniWorkApi.delete(id);
        toast.success(`Significant work "${workName}" deleted successfully!`);

        // Reload current page
        loadWorks();

        // Clear selection if any
        setSelectedWorks([]);
      } catch (error) {
        toast.error("Failed to delete significant work");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWorks.length == 0) {
      toast.error("No items selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedWorks.length} selected items?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Show loading toast
        const loadingToast = toast.loading(
          `Deleting ${selectedWorks.length} items...`,
        );

        // Delete all selected items
        await Promise.all(selectedWorks.map((id) => SigniWorkApi.delete(id)));

        toast.dismiss(loadingToast);
        toast.success(`${selectedWorks.length} items deleted successfully!`);

        // Reload current page
        await loadWorks();

        // Clear selection
        setSelectedWorks([]);

        // If current page is empty and not first page, go to previous page
        if (works.length == 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        toast.error("Failed to delete some items");
      }
    }
  };

  const handleRefresh = () => {
    loadWorks();
    toast.success("Data refreshed successfully!");
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterFees("all");
    setFilterReimburse("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSortIcon = (field) => {
    if (sortField != field) return null;
    return sortDirection == "asc" ? "↑" : "↓";
  };

  // Stats based on current data
  const activeCount = works.filter((w) => w.Is_Active == 1).length;
  const feesCount = works.filter((w) => w.SWrk_Fees == 1).length;
  const reimburseCount = works.filter((w) => w.Is_Reimburse == 1).length;

  // Stats Card Component
  const StatCard = ({ title, value, icon: Icon, color, subValue }) => {
    const colors =
      {
        purple: {
          bg: "from-purple-500 to-purple-600",
          text: "text-purple-700",
          light: "bg-purple-50",
          border: "border-purple-200",
          iconBg: "bg-purple-500",
        },
        green: {
          bg: "from-green-500 to-green-600",
          text: "text-green-700",
          light: "bg-green-50",
          border: "border-green-200",
          iconBg: "bg-green-500",
        },
        blue: {
          bg: "from-blue-500 to-blue-600",
          text: "text-blue-700",
          light: "bg-blue-50",
          border: "border-blue-200",
          iconBg: "bg-blue-500",
        },
        pink: {
          bg: "from-pink-500 to-pink-600",
          text: "text-pink-700",
          light: "bg-pink-50",
          border: "border-pink-200",
          iconBg: "bg-pink-500",
        },
      }[color] || colors.purple;

    return (
      <div
        className={`bg-white rounded-xl border ${colors.border} p-6 hover:shadow-lg transition-all duration-200 group relative overflow-hidden`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colors.light} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        ></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {subValue && (
              <p className={`text-sm font-medium ${colors.text}`}>{subValue}</p>
            )}
          </div>
          <div
            className={`${colors.iconBg} text-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
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
            <p className="text-sm text-gray-600 mt-1">
              Showing {paginationMeta.from || 0} - {paginationMeta.to || 0} of{" "}
              {paginationMeta.total || 0} entries
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/performance-discipline-masters/significant-work-master/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Work
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              defaultValue={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedWorks.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedWorks.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">
                  {selectedWorks.length} item(s) selected
                </span>
                <p className="text-xs text-purple-600">
                  Choose an action for selected items
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
              </button>
              <button
                onClick={() => setSelectedWorks([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
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
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    checked={
                      selectedWorks.length == works.length && works.length > 0
                    }
                    onChange={(e) => {
                      setSelectedWorks(
                        e.target.checked ? works.map((w) => w.SWrk_Id) : [],
                      );
                    }}
                  />
                </th>
               
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("SWrk_Name")}
                >
                  <div className="flex items-center">
                    Name{" "}
                    {getSortIcon("SWrk_Name") && (
                      <span className="ml-1 text-purple-600">
                        {getSortIcon("SWrk_Name")}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("SWrk_Fees")}
                >
                  <div className="flex items-center">
                    Has Fees{" "}
                    {getSortIcon("SWrk_Fees") && (
                      <span className="ml-1 text-purple-600">
                        {getSortIcon("SWrk_Fees")}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Is_Reimburse")}
                >
                  <div className="flex items-center">
                    Reimburse{" "}
                    {getSortIcon("Is_Reimburse") && (
                      <span className="ml-1 text-purple-600">
                        {getSortIcon("Is_Reimburse")}
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
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading significant work...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : works.length > 0 ? (
                works.map((work) => (
                  <tr
                    key={work.SWrk_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/performance-discipline-masters/significant-work-master/view/${work.SWrk_Id}`,
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
                        className="h-4 w-4 text-purple-600 rounded"
                        checked={selectedWorks.includes(work.SWrk_Id)}
                        onChange={(e) => {
                          setSelectedWorks((prev) =>
                            e.target.checked
                              ? [...prev, work.SWrk_Id]
                              : prev.filter((id) => id != work.SWrk_Id),
                          );
                        }}
                      />
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {work.SWrk_Name?.charAt(0) || "W"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">
                            {work.SWrk_Name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {work.SWrk_Fees == 1 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <DollarSign className="h-3 w-3 mr-1" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {work.Is_Reimburse == 1 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <RotateCcw className="h-3 w-3 mr-1" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
                          to={`/masters/performance-discipline-masters/significant-work-master/view/${work.SWrk_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/performance-discipline-masters/significant-work-master/edit/${work.SWrk_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(work.SWrk_Id, work.SWrk_Name)
                          }
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
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
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Briefcase className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No significant work found
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm ||
                        filterStatus != "all" ||
                        filterFees != "all" ||
                        filterReimburse != "all"
                          ? "Try adjusting your search or filters"
                          : "Get started by creating your first significant work."}
                      </p>
                      {searchTerm ||
                      filterStatus != "all" ||
                      filterFees != "all" ||
                      filterReimburse != "all" ? (
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg"
                        >
                          <X className="h-4 w-4 mr-2" /> Clear Filters
                        </button>
                      ) : (
                        <Link
                          to="/masters/performance-discipline-masters/significant-work-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-700 text-white font-medium rounded-lg"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Work
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
      {paginationMeta.total > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {paginationMeta.from || 0} to {paginationMeta.to || 0} of{" "}
              {paginationMeta.total} items
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </button>

            {Array.from(
              { length: Math.min(5, paginationMeta.last_page) },
              (_, i) => {
                let pageNum;
                if (paginationMeta.last_page <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= paginationMeta.last_page - 2) {
                  pageNum = paginationMeta.last_page - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      currentPage == pageNum
                        ? "bg-gradient-to-r from-purple-600 to-pink-700 text-white shadow-sm"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              },
            )}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(paginationMeta.last_page, p + 1))
              }
              disabled={currentPage == paginationMeta.last_page}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SigniWorkList;
