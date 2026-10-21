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
  Briefcase,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Hash,
  Tag,
  DollarSign,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import GradeApi from "../../../services/gradeapi";

const GradeList = ({ user }) => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [allGrades, setAllGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [sortField, setSortField] = useState("EGM_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("Grade Pay Master");
  const [initialLoad, setInitialLoad] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/payroll-pay-structures/grade-pay-master";
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
    loadAllGrades();
  }, []);

  useEffect(() => {
    if (!initialLoad && allGrades.length > 0) {
      applyFiltersAndPagination();
    }
  }, [
    searchTerm,
    currentPage,
    sortField,
    sortDirection,
    filterStatus,
    allGrades,
    initialLoad,
  ]);

  const loadAllGrades = async () => {
    setLoading(true);
    try {
      const response = await GradeApi.getAll();

      console.log("Full API Response:", response); // Debug log

      let gradesData = [];

      if (response && response.success == true) {
        // The actual data array is at response.data.data
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          gradesData = response.data.data;
          console.log("Extracted grades:", gradesData);
        }
        // Fallback cases
        else if (response.data && Array.isArray(response.data)) {
          gradesData = response.data;
        } else if (Array.isArray(response)) {
          gradesData = response;
        }
      } else if (Array.isArray(response)) {
        gradesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        gradesData = response.data;
      }

      console.log("Final grades data:", gradesData);

      setAllGrades(gradesData);
      setInitialLoad(false);

      // Trigger filter and pagination immediately if there's data
      if (gradesData.length > 0) {
        applyFiltersAndPagination();
      }
    } catch (error) {
      console.error("Error loading grades:", error);
      toast.error(error.message || "Failed to load grades");
      setAllGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = () => {
    const gradesArray = Array.isArray(allGrades) ? allGrades : [];

    let filteredData = [...gradesArray];

    if (searchTerm && searchTerm.trim() != "") {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredData = filteredData.filter(
        (grade) =>
          grade.EGM_Name.toLowerCase().includes(searchLower) ||
          (grade.EGM_Code &&
            grade.EGM_Code.toLowerCase().includes(searchLower)) ||
          grade.EGM_Id.toString().includes(searchLower) ||
          (grade.pay_band?.PB_Code || "").toLowerCase().includes(searchLower),
      );
    }

    if (filterStatus != "all") {
      filteredData = filteredData.filter((grade) =>
        filterStatus == "active" ? grade.Is_Active == 1 : grade.Is_Active == 0,
      );
    }

    filteredData.sort((a, b) => {
      let aValue, bValue;

      if (sortField == "pay_band") {
        aValue = a.pay_band?.PB_Code || "";
        bValue = b.pay_band?.PB_Code || "";
      } else if (sortField == "status") {
        aValue = a.Is_Active == 1 ? 1 : 0;
        bValue = b.Is_Active == 1 ? 1 : 0;
      } else if (sortField == "EGM_Code") {
        aValue = a.EGM_Code || "";
        bValue = b.EGM_Code || "";
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (typeof aValue == "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection == "asc" ? comparison : -comparison;
      } else {
        if (aValue < bValue) return sortDirection == "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection == "asc" ? 1 : -1;
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

    setGrades(paginatedData);
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

  const handleDelete = async (id, gradeName) => {
    const result = await Swal.fire({
      title: "Delete Grade?",
      text: `Are you sure you want to delete "${gradeName}"? This action cannot be undone.`,
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
        await GradeApi.delete(id);

        const response = await GradeApi.getAll();
        if (response && response.success == true) {
          const gradesData = response.data?.data || [];
          setAllGrades(gradesData);
        }

        toast.success(`Grade "${gradeName}" deleted successfully!`);

        if (grades.length == 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        toast.error("Failed to delete grade");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGrades.length == 0) {
      toast.error("No items selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedGrades.length} selected items?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedGrades.map((id) => GradeApi.delete(id)));

        const response = await GradeApi.getAll();
        if (response && response.success == true) {
          const gradesData = response.data?.data || [];
          setAllGrades(gradesData);
        }

        setSelectedGrades([]);
        toast.success(`${selectedGrades.length} items deleted successfully!`);

        // Ensure allGrades is an array before using length
        const gradesArray = Array.isArray(allGrades) ? allGrades : [];
        const remainingCount = gradesArray.length - selectedGrades.length;
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
      const response = await GradeApi.getAll();
      if (response && response.success == true) {
        const gradesData = response.data?.data || [];
        setAllGrades(gradesData);
        toast.success("Data refreshed successfully!");
      }
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

  const formatCurrency = (amount) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const StatCard = ({ title, value, subValue, icon: Icon, color }) => {
    const colors = {
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
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/masters/payroll-pay-structures/grade-pay-master/create"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Grade
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code,pay band..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
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

        {selectedGrades.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedGrades.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">
                  {selectedGrades.length} item(s) selected
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
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedGrades([])}
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
                      className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-offset-0"
                      checked={
                        selectedGrades.length == grades.length &&
                        grades.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGrades(grades.map((g) => g.EGM_Id));
                        } else {
                          setSelectedGrades([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("EGM_Code")}
                >
                  <div className="flex items-center">
                    Code
                    {sortField == "EGM_Code" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("EGM_Name")}
                >
                  <div className="flex items-center">
                    Grade Name
                    {sortField == "EGM_Name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("pay_band")}
                >
                  <div className="flex items-center">
                    Pay Band
                    {sortField == "pay_band" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Pay Range
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortField == "status" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">Loading grades...</p>
                    </div>
                  </td>
                </tr>
              ) : grades.length > 0 ? (
                grades.map((grade) => {
                  return (
                    <tr
                      key={grade.EGM_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/masters/payroll-pay-structures/grade-pay-master/view/${grade.EGM_Id}`,
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
                            className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 focus:ring-offset-0"
                            checked={selectedGrades.includes(grade.EGM_Id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGrades([
                                  ...selectedGrades,
                                  grade.EGM_Id,
                                ]);
                              } else {
                                setSelectedGrades(
                                  selectedGrades.filter(
                                    (id) => id != grade.EGM_Id,
                                  ),
                                );
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {grade.EGM_Code || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-sm">
                              {grade.EGM_Name?.charAt(0) || "G"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-150">
                              {grade.EGM_Name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {grade.pay_band?.PB_Code || "—"}
                        </span>
                        {grade.pay_band?.commission && (
                          <div className="text-xs text-gray-500">
                            {grade.pay_band.commission.PC_Name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {grade.pay_band ? (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">
                              ₹
                              {parseFloat(
                                grade.pay_band.Min_Pay,
                              ).toLocaleString()}{" "}
                              - ₹
                              {parseFloat(
                                grade.pay_band.Max_Pay,
                              ).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            grade.Is_Active == 1
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {grade.Is_Active == 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/payroll-pay-structures/grade-pay-master/view/${grade.EGM_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/payroll-pay-structures/grade-pay-master/edit/${grade.EGM_Id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(grade.EGM_Id, grade.EGM_Name);
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
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Briefcase className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterStatus != "all"
                          ? "No grades found"
                          : "No grades yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm || filterStatus != "all"
                          ? "No items match your search criteria. Try adjusting your search term or filters."
                          : "Get started by creating your first grade."}
                      </p>
                      {!searchTerm && filterStatus == "all" && (
                        <Link
                          to="/masters/payroll-pay-structures/grade-pay-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Grade
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
            {searchTerm || filterStatus != "all" ? (
              <span className="text-sm text-gray-500">
                (filtered from {Array.isArray(allGrades) ? allGrades.length : 0}{" "}
                total)
              </span>
            ) : null}
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
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm"
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

export default GradeList;
