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
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  User,
  Calendar,
  Award,
  Building2,
  Hash,
  Users,
  BookOpen,
  Loader,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EmployeeEducationProfileApi from "../../../services/employeeeducationprofileapi";
import axios from "axios";

const EmployeeEducationProfileList = ({ user }) => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortField, setSortField] = useState("EEP_Date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Employee Education Profile");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
  });

  // Cache for qualification data
  const [qualificationsCache, setQualificationsCache] = useState({});
  const [loadingQualifications, setLoadingQualifications] = useState(false);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/masters/employee-records/employee-qualification-details";
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
    loadProfiles();
  }, [currentPage]);

  // Pre-load all qualifications for better performance
  useEffect(() => {
    fetchAllQualifications();
  }, []);

  const fetchAllQualifications = async () => {
    setLoadingQualifications(true);
    try {
      const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
      const response = await axios.get(`${API_BASE_URL}/emp-edu/all`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      if (
        response.data &&
        response.data.success == true &&
        response.data.data
      ) {
        // Create a cache object with EEd_Id as key
        const cache = {};
        response.data.data.forEach((qual) => {
          cache[qual.EEd_Id] = qual;
        });
        setQualificationsCache(cache);
      }
    } catch (error) {
      console.error("Error fetching qualifications:", error);
    } finally {
      setLoadingQualifications(false);
    }
  };

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await EmployeeEducationProfileApi.getAll(params);

      if (response.success) {
        const data = response.data.data || [];

        // Enhance profile data with qualification details from cache
        const enhancedData = data.map((profile) => ({
          ...profile,
          qualificationDetails: qualificationsCache[profile.EED_Id] || null,
        }));

        setProfiles(enhancedData);
        setPagination({
          current_page: response.data.current_page || 1,
          last_page: response.data.last_page || 1,
          per_page: response.data.per_page || itemsPerPage,
          total: response.data.total || 0,
          from: response.data.from || 0,
          to: response.data.to || 0,
        });

        // Calculate stats
        const active = data.filter(
          (p) => p.Is_Active == true || p.Is_Active == 1 || p.Is_Active == "1",
        ).length;
        setStats({
          total: data.length,
          active: active,
        });
      } else {
        toast.error("Failed to load education profiles");
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast.error("Failed to load education profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadProfiles();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSort = (field) => {
    const newDirection =
      sortField == field && sortDirection == "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);

    const sorted = [...profiles].sort((a, b) => {
      const aValue = a[field] ?? "";
      const bValue = b[field] ?? "";

      if (newDirection == "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setProfiles(sorted);
  };

  const handleDelete = async (EEP_Id, employeeName) => {
    const result = await Swal.fire({
      title: "Delete Education Profile?",
      text: `Are you sure you want to delete this education profile for ${employeeName}? This action cannot be undone.`,
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
        await EmployeeEducationProfileApi.delete(EEP_Id);
        toast.success("Education profile deleted successfully!");
        loadProfiles();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete education profile",
        );
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length == 0) {
      toast.error("No items selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedItems.length} selected items?`,
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
          selectedItems.map((id) => EmployeeEducationProfileApi.delete(id)),
        );
        toast.success(`${selectedItems.length} items deleted successfully!`);
        setSelectedItems([]);
        loadProfiles();
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Failed to delete some items");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (isActive) => {
    const active = isActive == true || isActive == 1 || isActive == "1";
    return active ? (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const getQualificationDisplay = (profile) => {
    // First try to get from cache/enhanced data
    if (profile.education_degree) {
      const qual = profile.education_degree;
      return {
        name: qual.EEd_Name || `Qualification #${profile.EED_Id}`,
        code: qual.EEd_Code || null,
      };
    }

    // Fallback to direct properties if available
    if (profile.EED_Name) {
      return {
        name: profile.EED_Name,
        code: profile.EED_Code || null,
      };
    }

    // Last resort fallback
    return {
      name: `Qualification #${profile.EED_Id}`,
      code: null,
    };
  };

  const getEmployeeDisplay = (profile) => {
    if (profile.employee_master) {
      const emp = profile.employee_master;
      const firstName = emp.First_Name || "";
      const lastName = emp.Last_Name || "";
      const empCode = emp.Emp_Code || "";

      const fullName = `${firstName} ${lastName}`.trim();

      if (empCode && fullName) {
        return `${empCode} - ${fullName}`;
      } else if (empCode) {
        return empCode;
      } else if (fullName) {
        return fullName;
      }
    }
    return `Employee #${profile.Emp_Id}`;
  };

  const StatCard = ({ title, value, icon: Icon, color, subValue }) => {
    const colors = {
      blue: {
        bg: "from-blue-500 to-blue-600",
        light: "bg-blue-50",
        border: "border-blue-200",
        iconBg: "bg-blue-500",
      },
      green: {
        bg: "from-green-500 to-green-600",
        light: "bg-green-50",
        border: "border-green-200",
        iconBg: "bg-green-500",
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
            {subValue && <p className="text-sm text-gray-600">{subValue}</p>}
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
            <p className="text-gray-600 mt-1">
              Manage employee education qualifications
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/masters/employee-records/employee-qualification-details/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add Education Profile
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name, qualification, institution, or year..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadProfiles}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedItems.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedItems.length} item(s) selected
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
                onClick={() => setSelectedItems([])}
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
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                      checked={
                        selectedItems.length == profiles.length &&
                        profiles.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(profiles.map((item) => item.EEP_Id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Qualification
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Institution
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading education profiles...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : profiles.length > 0 ? (
                profiles.map((item) => {
                  const employeeDisplay = getEmployeeDisplay(item);
                  const qualification = getQualificationDisplay(item);
                  const hasMarks =
                    item.Obtain_Grade ||
                    item.Obtain_Marks ||
                    item.Total_Marks ||
                    item.Pass_Year;

                  return (
                    <tr
                      key={item.EEP_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons") &&
                          !e.target.closest("a")
                        ) {
                          navigate(
                            `/masters/employee-records/employee-qualification-details/view/${item.EEP_Id}`,
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
                            checked={selectedItems.includes(item.EEP_Id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([
                                  ...selectedItems,
                                  item.EEP_Id,
                                ]);
                              } else {
                                setSelectedItems(
                                  selectedItems.filter(
                                    (id) => id != item.EEP_Id,
                                  ),
                                );
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employeeDisplay}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <BookOpen className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {qualification.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-900">
                            {formatDate(item.EEP_Date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {hasMarks ? (
                          <div className="space-y-1">
                            {item.Obtain_Grade && (
                              <div className="flex items-center text-xs">
                                <Award className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                                <span className="text-gray-700">
                                  Grade: {item.Obtain_Grade}
                                </span>
                              </div>
                            )}
                            {(item.Obtain_Marks || item.Total_Marks) && (
                              <div className="flex items-center text-xs">
                                <Hash className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                                <span className="text-gray-700">
                                  {item.Obtain_Marks || 0} /{" "}
                                  {item.Total_Marks || 0}
                                </span>
                              </div>
                            )}
                            {item.Pass_Year && (
                              <div className="text-xs text-gray-500">
                                Year: {item.Pass_Year}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-900">
                            {item.Name_Insti || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(item.Is_Active)}
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/employee-records/employee-qualification-details/view/${item.EEP_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/employee-records/employee-qualification-details/edit/${item.EEP_Id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(item.EEP_Id, employeeDisplay)
                            }
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <GraduationCap className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No education profiles found"
                          : "No education profiles yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "No profiles match your search criteria. Try adjusting your search term."
                          : "Get started by adding an education profile for an employee."}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/employee-records/employee-qualification-details/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Education Profile
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
      {profiles.length > 0 && pagination.last_page > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
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
            {Array.from(
              { length: Math.min(5, pagination.last_page) },
              (_, i) => {
                let pageNum;
                if (pagination.last_page <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.last_page - 2) {
                  pageNum = pagination.last_page - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

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
              },
            )}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.last_page, p + 1))
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

export default EmployeeEducationProfileList;
