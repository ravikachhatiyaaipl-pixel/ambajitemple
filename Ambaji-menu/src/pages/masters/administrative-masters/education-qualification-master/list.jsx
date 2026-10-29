import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Code,
  Tag,
  Award,
  Brain,
  Briefcase,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EducationApi from "../../../services/educationApi";

const EducationList = ({ user }) => {
  const navigate = useNavigate();
  const [educations, setEducations] = useState([]);
  const [allEducations, setAllEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedEducations, setSelectedEducations] = useState([]);
  const [sortField, setSortField] = useState("EEd_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("Education Qualification Master");
  const [initialLoad, setInitialLoad] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [filterMandatory, setFilterMandatory] = useState("all"); // all, mandatory, optional
  const [filterTechnical, setFilterTechnical] = useState("all"); // all, technical, non_technical

  // Set page title from menu (optional)
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/masters/administrative-masters/education-qualification-master";
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
    loadAllEducations();
  }, []);

  // Apply filters and pagination whenever dependencies change
  useEffect(() => {
    if (!initialLoad && allEducations.length > 0) {
      applyFiltersAndPagination();
    }
  }, [
    searchTerm,
    currentPage,
    sortField,
    sortDirection,
    filterStatus,
    filterMandatory,
    filterTechnical,
    allEducations,
    initialLoad,
  ]);

  const loadAllEducations = async () => {
    setLoading(true);
    try {
      const response = await EducationApi.getAll();
      setAllEducations(response.data || []);
      setInitialLoad(false);
    } catch (error) {
      toast.error("Failed to load education qualifications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = () => {
    let filteredData = [...allEducations];

    // Apply search filter
    if (searchTerm && searchTerm.trim() != "") {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredData = filteredData.filter(
        (edu) =>
          edu.EEd_Name?.toLowerCase().includes(searchLower) ||
          edu.EEd_Code?.toLowerCase().includes(searchLower) ||
          edu.EEd_Id?.toString().includes(searchLower),
      );
    }

    // Apply status filter
    if (filterStatus != "all") {
      filteredData = filteredData.filter((edu) =>
        filterStatus == "active" ? edu.Is_Active == 1 : edu.Is_Active != 1,
      );
    }

    // Apply mandatory filter
    if (filterMandatory != "all") {
      filteredData = filteredData.filter((edu) =>
        filterMandatory == "mandatory"
          ? edu.Is_Mandatory == "Y"
          : edu.Is_Mandatory == "N",
      );
    }

    // Apply technical filter
    if (filterTechnical != "all") {
      filteredData = filteredData.filter((edu) =>
        filterTechnical == "technical"
          ? edu.Is_Technical == "Y"
          : edu.Is_Technical == "N",
      );
    }

    // Apply sorting
    filteredData.sort((a, b) => {
      let aValue, bValue;
      if (sortField == "status") {
        aValue = a.Is_Active == 1 ? 1 : 0;
        bValue = b.Is_Active == 1 ? 1 : 0;
      } else if (sortField == "Is_Mandatory") {
        aValue = a.Is_Mandatory == "Y" ? 1 : 0;
        bValue = b.Is_Mandatory == "Y" ? 1 : 0;
      } else if (sortField == "Is_Technical") {
        aValue = a.Is_Technical == "Y" ? 1 : 0;
        bValue = b.Is_Technical == "Y" ? 1 : 0;
      } else if (sortField == "Is_Professional") {
        aValue = a.Is_Professional == "Y" ? 1 : 0;
        bValue = b.Is_Professional == "Y" ? 1 : 0;
      } else if (sortField == "Is_Promotional") {
        aValue = a.Is_Promotional == "Y" ? 1 : 0;
        bValue = b.Is_Promotional == "Y" ? 1 : 0;
      } else if (sortField == "Rec_Valid") {
        aValue = a.Rec_Valid == "Y" ? 1 : 0;
        bValue = b.Rec_Valid == "Y" ? 1 : 0;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (typeof aValue == "string") {
        const comparison = aValue.localeCompare(bValue || "");
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

    setEducations(paginatedData);
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

  const handleDelete = async (id, eduName) => {
    const result = await Swal.fire({
      title: "Delete Education Qualification?",
      text: `Are you sure you want to delete "${eduName}"? This action cannot be undone.`,
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
        await EducationApi.delete(id);
        // Refresh list after delete
        const response = await EducationApi.getAll();
        setAllEducations(response.data || []);
        toast.success(
          `Education qualification "${eduName}" deleted successfully!`,
        );

        // Adjust current page if last item on page was deleted
        if (educations.length == 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        toast.error("Failed to delete education qualification");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEducations.length == 0) {
      toast.error("No items selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedEducations.length} selected items?`,
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
          selectedEducations.map((id) => EducationApi.delete(id)),
        );
        const response = await EducationApi.getAll();
        setAllEducations(response.data || []);
        setSelectedEducations([]);
        toast.success(
          `${selectedEducations.length} items deleted successfully!`,
        );

        const remainingCount = allEducations.length - selectedEducations.length;
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
      const response = await EducationApi.getAll();
      setAllEducations(response.data || []);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getYesNoBadge = (value, type = "default") => {
    const isYes = value == "Y" || value == 1 || value == "1";
    const colors = {
      default: isYes
        ? "bg-green-100 text-green-800"
        : "bg-gray-100 text-gray-800",
      mandatory: isYes
        ? "bg-purple-100 text-purple-800"
        : "bg-gray-100 text-gray-800",
      technical: isYes
        ? "bg-blue-100 text-blue-800"
        : "bg-gray-100 text-gray-800",
      professional: isYes
        ? "bg-indigo-100 text-indigo-800"
        : "bg-gray-100 text-gray-800",
      promotional: isYes
        ? "bg-pink-100 text-pink-800"
        : "bg-gray-100 text-gray-800",
      valid: isYes
        ? "bg-emerald-100 text-emerald-800"
        : "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type] || colors.default}`}
      >
        {isYes ? "Yes" : "No"}
      </span>
    );
  };

  // Stats Card Component
  const StatCard = ({ title, value, subValue, icon: Icon, color }) => {
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
        amber: {
          bg: "from-amber-500 to-amber-600",
          text: "text-amber-700",
          light: "bg-amber-50",
          border: "border-amber-200",
          iconBg: "bg-amber-500",
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
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/administrative-masters/education-qualification-master/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Qualification
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
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterMandatory}
              onChange={(e) => {
                setFilterMandatory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Mandatory</option>
              <option value="mandatory">Mandatory</option>
              <option value="optional">Optional</option>
            </select>
            <select
              value={filterTechnical}
              onChange={(e) => {
                setFilterTechnical(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Technical</option>
              <option value="technical">Technical</option>
              <option value="non_technical">Non-Technical</option>
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
        {selectedEducations.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedEducations.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">
                  {selectedEducations.length} item(s) selected
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
                onClick={() => setSelectedEducations([])}
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
                      selectedEducations.length == educations.length &&
                      educations.length > 0
                    }
                    onChange={(e) => {
                      setSelectedEducations(
                        e.target.checked ? educations.map((e) => e.EEd_Id) : [],
                      );
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
                      <span className="ml-1 text-purple-600">
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
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Is_Mandatory")}
                >
                  <div className="flex items-center">
                    Mandatory{" "}
                    {sortField == "Is_Mandatory" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Is_Technical")}
                >
                  <div className="flex items-center">
                    Technical{" "}
                    {sortField == "Is_Technical" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Is_Professional")}
                >
                  <div className="flex items-center">
                    Professional{" "}
                    {sortField == "Is_Professional" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Is_Promotional")}
                >
                  <div className="flex items-center">
                    Promotional{" "}
                    {sortField == "Is_Promotional" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("Rec_Valid")}
                >
                  <div className="flex items-center">
                    Valid{" "}
                    {sortField == "Rec_Valid" && (
                      <span className="ml-1 text-purple-600">
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
                  <td colSpan="12" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading education qualifications...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : educations.length > 0 ? (
                educations.map((edu) => (
                  <tr
                    key={edu.EEd_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/administrative-masters/education-qualification-master/view/${edu.EEd_Id}`,
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
                        checked={selectedEducations.includes(edu.EEd_Id)}
                        onChange={(e) => {
                          setSelectedEducations((prev) =>
                            e.target.checked
                              ? [...prev, edu.EEd_Id]
                              : prev.filter((id) => id != edu.EEd_Id),
                          );
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Code className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {edu.EEd_Code || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {edu.EEd_Name?.charAt(0) || "E"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">
                            {edu.EEd_Name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getYesNoBadge(edu.Is_Mandatory, "mandatory")}
                    </td>
                    <td className="px-6 py-4">
                      {getYesNoBadge(edu.Is_Technical, "technical")}
                    </td>
                    <td className="px-6 py-4">
                      {getYesNoBadge(edu.Is_Professional, "professional")}
                    </td>
                    <td className="px-6 py-4">
                      {getYesNoBadge(edu.Is_Promotional, "promotional")}
                    </td>
                    <td className="px-6 py-4">
                      {getYesNoBadge(edu.Rec_Valid, "valid")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${edu.Is_Active == 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {edu.Is_Active == 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/administrative-masters/education-qualification-master/view/${edu.EEd_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/administrative-masters/education-qualification-master/edit/${edu.EEd_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(edu.EEd_Id, edu.EEd_Name)}
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
                  <td colSpan="12" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <GraduationCap className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No education qualifications found
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        Get started by creating your first education
                        qualification.
                      </p>
                      <Link
                        to="/masters/administrative-masters/education-qualification-master/create"
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-700 text-white font-medium rounded-lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Qualification
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
            {(searchTerm ||
              filterStatus != "all" ||
              filterMandatory != "all" ||
              filterTechnical != "all") && (
              <span className="text-sm text-gray-500">
                (filtered from {allEducations.length} total)
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
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${currentPage == pageNum ? "bg-gradient-to-r from-purple-600 to-pink-700 text-white shadow-sm" : "bg-white border border-gray-300 hover:bg-gray-50"}`}
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

export default EducationList;
