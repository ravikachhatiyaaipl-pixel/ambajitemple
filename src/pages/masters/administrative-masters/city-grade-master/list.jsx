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
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Award,
  Copy,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { CityGradeApi } from "../../../services/citygrademasterapi";

const CityGradeList = ({ user }) => {
  const [cityGrades, setCityGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCityGrades, setSelectedCityGrades] = useState([]);
  const [sortField, setSortField] = useState("City_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("City Grade Master");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/administrative-masters/city-grade";
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
    loadCityGrades();
  }, [currentPage, searchTerm]);

  const loadCityGrades = async () => {
    setLoading(true);
    try {
      const result = await CityGradeApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      setCityGrades(result.data);
      setPagination({
        current_page: result.meta.current_page || 1,
        last_page: result.meta.last_page || 1,
        per_page: result.meta.per_page || itemsPerPage,
        total: result.meta.total || result.data.length,
        from: result.meta.from || 1,
        to: result.meta.to || result.data.length,
      });
      setSelectedCityGrades([]);
    } catch (error) {
      toast.error(error.message || "Failed to load city grades");
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
  };

  const sortedCityGrades = [...cityGrades].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal < bVal) return sortDirection == "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const handleDeleteCityGrade = async (cityGradeId, cityName, grade) => {
    const result = await Swal.fire({
      title: "Delete City Grade?",
      text: `Are you sure you want to delete "${cityName} - Grade ${grade}"? This action cannot be undone.`,
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
        await CityGradeApi.delete(cityGradeId);
        await loadCityGrades();
        toast.success(`City grade deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete city grade");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCityGrades.length == 0) {
      toast.error("No city grades selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedCityGrades.length} selected city grades?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const deletePromises = selectedCityGrades.map((id) =>
          CityGradeApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadCityGrades();
        setSelectedCityGrades([]);
        toast.success(
          `${selectedCityGrades.length} city grades deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some city grades");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const stats = {
    totalCities: pagination.total,
    uniqueGrades: [...new Set(cityGrades.map((item) => item.Grade))].length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(
      pagination.last_page,
      startPage + maxVisiblePages - 1,
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
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
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/administrative-masters/city-grade/create"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New City Grade
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
              placeholder="Search cities by name or grade..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
                loadCityGrades();
              }}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedCityGrades.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedCityGrades.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">
                  {selectedCityGrades.length} city grade(s) selected
                </span>
                <p className="text-xs text-purple-600">
                  Choose an action for selected cities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedCityGrades([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedCityGrades.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* City Grades Table */}
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
                        selectedCityGrades.length == cityGrades.length &&
                        cityGrades.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCityGrades(
                            cityGrades.map((c) => c.CGR_Id),
                          );
                        } else {
                          setSelectedCityGrades([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("City_Name")}
                >
                  <div className="flex items-center">
                    City Name
                    {sortField == "City_Name" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Grade")}
                >
                  <div className="flex items-center">
                    Grade
                    {sortField == "Grade" && (
                      <span className="ml-1 text-purple-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading city grades...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : sortedCityGrades.length > 0 ? (
                sortedCityGrades.map((cityGrade) => (
                  <tr
                    key={cityGrade.CGR_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/administrative-masters/city-grade/view/${cityGrade.CGR_Id}`,
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
                          checked={selectedCityGrades.includes(
                            cityGrade.CGR_Id,
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCityGrades([
                                ...selectedCityGrades,
                                cityGrade.CGR_Id,
                              ]);
                            } else {
                              setSelectedCityGrades(
                                selectedCityGrades.filter(
                                  (id) => id != cityGrade.CGR_Id,
                                ),
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-150">
                            {cityGrade.City_Name}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyToClipboard(cityGrade.City_Name);
                          }}
                          className="ml-2 p-1 hover:bg-purple-50 rounded transition-colors"
                          title="Copy city name"
                        >
                          <Copy className="h-3 w-3 text-gray-400 hover:text-purple-600" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-2">
                          <Award className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-purple-700">
                          {cityGrade.Grade}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(cityGrade.created_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(cityGrade.created_at)}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/administrative-masters/city-grade/view/${cityGrade.CGR_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/administrative-masters/city-grade/edit/${cityGrade.CGR_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!cityGrade.deleted_at && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCityGrade(
                                cityGrade.CGR_Id,
                                cityGrade.City_Name,
                                cityGrade.Grade,
                              );
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No matching cities found"
                          : "No city grades found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding your first city grade"}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/administrative-masters/city-grade/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First City Grade
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
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
              city grades
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            {renderPagination().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentPage == page
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm"
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

export default CityGradeList;
