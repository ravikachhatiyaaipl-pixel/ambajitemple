import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Globe,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Hash,
  Code,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EmpLanguageApi from "../../../services/emplanguageapi";

const EmpLanguageList = ({ user }) => {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [sortField, setSortField] = useState("ELg_Id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("Employee Language Master");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/employee-records/employee-language-master";
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
    loadLanguages();
  }, [currentPage, searchTerm, sortField, sortDirection, filterStatus]);

  const loadLanguages = async () => {
    setLoading(true);
    try {
      // Prepare API params
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        sort_field: sortField,
        sort_direction: sortDirection,
      };

      // Add search param if exists
      if (searchTerm && searchTerm.trim() != "") {
        params.search = searchTerm.trim();
      }

      // Add status filter if not "all"
      if (filterStatus != "all") {
        params.status = filterStatus;
      }

      const response = await EmpLanguageApi.getAll(params);

      if (response?.success && response?.data) {
        // Extract the paginated data
        const paginatedData = response.data;
        setLanguages(paginatedData.data || []);
        setTotalItems(paginatedData.total || 0);
        setTotalPages(paginatedData.last_page || 1);
      } else {
        toast.error(response?.message || "Failed to load employee languages");
      }
    } catch (error) {
      toast.error("Failed to load employee languages");
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

  const handleDelete = async (id, languageName) => {
    const result = await Swal.fire({
      title: "Delete Employee Language?",
      text: `Are you sure you want to delete "${languageName}"? This action cannot be undone.`,
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
        await EmpLanguageApi.delete(id);
        toast.success(
          `Employee language "${languageName}" deleted successfully!`,
        );

        // Reload the current page
        await loadLanguages();

        // If current page becomes empty after deletion and not on first page, go to previous page
        if (languages.length == 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        toast.error("Failed to delete employee language");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLanguages.length == 0) {
      toast.error("No items selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedLanguages.length} selected items?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(
          selectedLanguages.map((id) => EmpLanguageApi.delete(id)),
        );
        setSelectedLanguages([]);
        toast.success(
          `${selectedLanguages.length} items deleted successfully!`,
        );

        // Reload the current page
        await loadLanguages();
      } catch (error) {
        toast.error("Failed to delete some items");
      }
    }
  };

  const handleRefresh = () => {
    loadLanguages();
    toast.success("Data refreshed successfully!");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const StatCard = ({ title, value, subValue, icon: Icon, color }) => {
    const colors = {
      blue: {
        bg: "from-blue-500 to-blue-600",
        text: "text-blue-700",
        light: "bg-blue-50",
        border: "border-blue-200",
        iconBg: "bg-blue-500",
      },
      green: {
        bg: "from-green-500 to-green-600",
        text: "text-green-700",
        light: "bg-green-50",
        border: "border-green-200",
        iconBg: "bg-green-500",
      },
      purple: {
        bg: "from-purple-500 to-purple-600",
        text: "text-purple-700",
        light: "bg-purple-50",
        border: "border-purple-200",
        iconBg: "bg-purple-500",
      },
    }[color];

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

  // Calculate stats from current data (you might want to get these from API later)
  const activeCount = languages.filter((l) => l.Is_Active).length;
  const inactiveCount = languages.filter((l) => !l.Is_Active).length;

  return (
    <div className="p-6">
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
              Manage employee languages for the system
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/masters/employee-records/employee-language-master/create"
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Language
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {selectedLanguages.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedLanguages.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedLanguages.length} item(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected items
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedLanguages([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500 focus:ring-offset-0"
                      checked={
                        selectedLanguages.length == languages.length &&
                        languages.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLanguages(languages.map((l) => l.ELg_Id));
                        } else {
                          setSelectedLanguages([]);
                        }
                      }}
                    />
                  </div>
                </th>

                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("ELg_Code")}
                >
                  <div className="flex items-center">
                    Language Code
                    {sortField == "ELg_Code" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Elg_Name")}
                >
                  <div className="flex items-center">
                    Language Name
                    {sortField == "Elg_Name" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Is_Active")}
                >
                  <div className="flex items-center">
                    Status
                    {sortField == "Is_Active" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created At
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
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading employee languages...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : languages.length > 0 ? (
                languages.map((lang) => {
                  return (
                    <tr
                      key={lang.ELg_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/masters/employee-records/employee-language-master/view/${lang.ELg_Id}`,
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
                            className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500 focus:ring-offset-0"
                            checked={selectedLanguages.includes(lang.ELg_Id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLanguages([
                                  ...selectedLanguages,
                                  lang.ELg_Id,
                                ]);
                              } else {
                                setSelectedLanguages(
                                  selectedLanguages.filter(
                                    (id) => id != lang.ELg_Id,
                                  ),
                                );
                              }
                            }}
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                            <Code className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {lang.ELg_Code || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {lang.Elg_Name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(lang.Is_Active)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {formatDate(lang.created_at)}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/employee-records/employee-language-master/view/${lang.ELg_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/employee-records/employee-language-master/edit/${lang.ELg_Id}`}
                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-150"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(lang.ELg_Id, lang.Elg_Name);
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Globe className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterStatus != "all"
                          ? "No languages found"
                          : "No languages yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm || filterStatus != "all"
                          ? "No items match your search criteria. Try adjusting your search term or filters."
                          : "Get started by creating your first employee language."}
                      </p>
                      {!searchTerm && filterStatus == "all" && (
                        <Link
                          to="/masters/employee-records/employee-language-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Language
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

      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              items
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
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
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    currentPage == pageNum
                      ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-sm"
                      : "bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage == totalPages}
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

export default EmpLanguageList;
