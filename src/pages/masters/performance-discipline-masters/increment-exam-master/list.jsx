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
  ToggleLeft,
  ToggleRight,
  Code,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import IncExamApi from "../../../services/incexamapi";

const IncExamList = ({ user }) => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [allExams, setAllExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedExams, setSelectedExams] = useState([]);
  const [sortField, setSortField] = useState("EEd_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("Increment Exam Master");
  const [initialLoad, setInitialLoad] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive

  // Set page title from menu (optional)
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/masters/performance-discipline-masters/increment-exam-master";
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

  // Load all data on mount
  useEffect(() => {
    loadAllExams();
  }, []);

  // Apply filters and pagination whenever dependencies change
  useEffect(() => {
    if (!initialLoad && allExams.length > 0) {
      applyFiltersAndPagination();
    }
  }, [
    searchTerm,
    currentPage,
    sortField,
    sortDirection,
    filterStatus,
    allExams,
    initialLoad,
  ]);

  const loadAllExams = async () => {
    setLoading(true);
    try {
      const response = await IncExamApi.getAll();
      console.log("API Response:", response);
      setAllExams(response.data || []);
      setInitialLoad(false);
    } catch (error) {
      toast.error("Failed to load increment exams");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = () => {
    let filteredData = [...allExams];

    // Apply search filter
    if (searchTerm && searchTerm.trim() != "") {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredData = filteredData.filter(
        (exam) =>
          (exam.EEd_Name &&
            exam.EEd_Name.toLowerCase().includes(searchLower)) ||
          (exam.EEd_Code && exam.EEd_Code.toLowerCase().includes(searchLower)),
      );
    }

    // Apply status filter
    if (filterStatus != "all") {
      filteredData = filteredData.filter((exam) => {
        if (filterStatus == "active") {
          return (
            exam.Is_Active == true ||
            exam.Is_Active == 1 ||
            exam.Is_Active == "1"
          );
        } else {
          return (
            exam.Is_Active == false ||
            exam.Is_Active == 0 ||
            exam.Is_Active == "0"
          );
        }
      });
    }

    // Apply sorting
    filteredData.sort((a, b) => {
      let aValue, bValue;

      if (sortField == "status") {
        aValue =
          a.Is_Active == true || a.Is_Active == 1 || a.Is_Active == "1" ? 1 : 0;
        bValue =
          b.Is_Active == true || b.Is_Active == 1 || b.Is_Active == "1" ? 1 : 0;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (typeof aValue == "string") {
        const comparison = (aValue || "").localeCompare(bValue || "");
        return sortDirection == "asc" ? comparison : -comparison;
      } else {
        if ((aValue || 0) < (bValue || 0))
          return sortDirection == "asc" ? -1 : 1;
        if ((aValue || 0) > (bValue || 0))
          return sortDirection == "asc" ? 1 : -1;
        return 0;
      }
    });

    setTotalItems(filteredData.length);
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

    setExams(paginatedData);
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

  const handleDelete = async (id, examName) => {
    const result = await Swal.fire({
      title: "Delete Increment Exam?",
      text: `Are you sure you want to delete "${examName}"? This action cannot be undone.`,
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
        await IncExamApi.delete(id);
        const response = await IncExamApi.getAll();
        setAllExams(response.data || []);
        toast.success(`Increment exam "${examName}" deleted successfully!`);

        if (exams.length == 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        toast.error("Failed to delete increment exam");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedExams.length == 0) {
      toast.error("No items selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedExams.length} selected items?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedExams.map((id) => IncExamApi.delete(id)));
        const response = await IncExamApi.getAll();
        setAllExams(response.data || []);
        setSelectedExams([]);
        toast.success(`${selectedExams.length} items deleted successfully!`);

        const remainingCount = allExams.length - selectedExams.length;
        const newTotalPages = Math.ceil(remainingCount / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else if (remainingCount == 0) {
          setCurrentPage(1);
        }
      } catch (error) {
        toast.error("Failed to delete some items");
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await IncExamApi.getAll();
      setAllExams(response.data || []);
      toast.success("Data refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getActiveStatus = (value) => {
    const isActive = value == true || value == 1 || value == "1";
    return isActive ? "Active" : "Inactive";
  };

  const isActive = (value) => {
    return value == true || value == 1 || value == "1";
  };

  // Stats Card Component
  const StatCard = ({ title, value, subValue, icon: Icon, color }) => {
    const colors =
      {
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
      }[color] || colors.blue;

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
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/performance-discipline-masters/increment-exam-master/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Exam
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
              placeholder="Search by name or code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
        {selectedExams.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedExams.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedExams.length} item(s) selected
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
                <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
              </button>
              <button
                onClick={() => setSelectedExams([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table - Without ID, Mandatory, Technical, Professional, Promotional, and Created columns */}
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
                      selectedExams.length == exams.length && exams.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExams(exams.map((e) => e.EEd_Id));
                      } else {
                        setSelectedExams([]);
                      }
                    }}
                  />
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("EEd_Code")}
                >
                  <div className="flex items-center">
                    Code{" "}
                    {sortField == "EEd_Code" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("EEd_Name")}
                >
                  <div className="flex items-center">
                    Name{" "}
                    {sortField == "EEd_Name" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status{" "}
                    {sortField == "status" && (
                      <span className="ml-1 text-blue-600">
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
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading increment exams...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : exams.length > 0 ? (
                exams.map((exam) => (
                  <tr
                    key={exam.EEd_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/performance-discipline-masters/increment-exam-master/view/${exam.EEd_Id}`,
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
                        className="h-4 w-4 text-blue-600 rounded"
                        checked={selectedExams.includes(exam.EEd_Id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExams((prev) => [...prev, exam.EEd_Id]);
                          } else {
                            setSelectedExams((prev) =>
                              prev.filter((id) => id != exam.EEd_Id),
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Code className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {exam.EEd_Code || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {exam.EEd_Name
                              ? exam.EEd_Name.charAt(0).toUpperCase()
                              : "E"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                            {exam.EEd_Name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive(exam.Is_Active) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {getActiveStatus(exam.Is_Active)}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/performance-discipline-masters/increment-exam-master/view/${exam.EEd_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/performance-discipline-masters/increment-exam-master/edit/${exam.EEd_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(exam.EEd_Id, exam.EEd_Name)
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
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Briefcase className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No increment exams found
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        Get started by creating your first increment exam.
                      </p>
                      <Link
                        to="/masters/performance-discipline-masters/increment-exam-master/create"
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Exam
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              items
            </span>
            {(searchTerm || filterStatus != "all") && (
              <span className="text-sm text-gray-500">
                (filtered from {allExams.length} total)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2)
                pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    currentPage == pageNum
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm"
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

export default IncExamList;
