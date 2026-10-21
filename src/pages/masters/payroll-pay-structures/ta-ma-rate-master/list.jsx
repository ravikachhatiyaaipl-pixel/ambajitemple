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
  DollarSign,
  Building,
  Award,
  Calendar,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Hash,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  X,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import Tamarate from "../../../services/tamarate";

const TamarateList = ({ user }) => {
  const navigate = useNavigate();
  const [allRates, setAllRates] = useState([]);
  const [filteredRates, setFilteredRates] = useState([]);
  const [displayedRates, setDisplayedRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("TA-MA Rate Master");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/payroll-pay-structures/ta-ma-rate-master";
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

  const [stats, setStats] = useState({
    totalRates: 0,
    uniqueGrades: 0,
    uniqueCities: 0,
  });

  useEffect(() => {
    loadAllRates();
  }, []);

  const loadAllRates = async () => {
    setLoading(true);
    try {
      const response = await Tamarate.getAll();

      if (response.success == true) {
        const data = response.data?.data || [];
        setAllRates(data);
        setFilteredRates(data);

        calculateStatistics(data);
      } else {
        toast.error(response.message || "Failed to load TA-MA rates");
      }
    } catch (error) {
      console.error("Error loading rates:", error);
      toast.error("Failed to load TA-MA rates");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (ratesData) => {
    if (!ratesData || ratesData.length == 0) {
      setStats({
        totalRates: 0,
        uniqueGrades: 0,
        uniqueCities: 0,
      });
      return;
    }

    const uniqueGrades = new Set();
    const uniqueCities = new Set();

    ratesData.forEach((rate) => {
      if (rate.EGM_Id) {
        uniqueGrades.add(rate.EGM_Id);
      }
      if (rate.CGR_Id) {
        uniqueCities.add(rate.CGR_Id);
      }
    });

    setStats({
      totalRates: ratesData.length,
      uniqueGrades: uniqueGrades.size,
      uniqueCities: uniqueCities.size,
    });
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRates(allRates);
      setCurrentPage(1);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = allRates.filter((rate) => {
      const empGrade = rate.emp_grade;
      const cityGrade = rate.city_grade;

      if (empGrade?.EGM_Name?.toLowerCase().includes(searchLower)) {
        return true;
      }
      if (empGrade?.EGM_Code?.toLowerCase().includes(searchLower)) {
        return true;
      }
      if (cityGrade?.City_Name?.toLowerCase().includes(searchLower)) {
        return true;
      }
      if (cityGrade?.Grade?.toLowerCase().includes(searchLower)) {
        return true;
      }
      if (rate.TA?.toString().includes(searchLower)) {
        return true;
      }
      if (rate.MA?.toString().includes(searchLower)) {
        return true;
      }

      return false;
    });

    setFilteredRates(filtered);
    setCurrentPage(1);
  }, [searchTerm, allRates]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedRates(filteredRates.slice(startIndex, endIndex));

    const pages = Math.ceil(filteredRates.length / itemsPerPage);
    setTotalPages(pages || 1);
  }, [filteredRates, currentPage, itemsPerPage]);

  const handleDeleteRate = async (id, gradeName, cityName) => {
    const result = await Swal.fire({
      title: "Delete TA-MA Rate?",
      text: `Are you sure you want to delete rate for "${gradeName}" with city "${cityName}"?`,
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
        await Tamarate.delete(id);
        await loadAllRates();
        setSelectedItems([]);
        toast.success("TA-MA rate deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete TA-MA rate");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length == 0) {
      toast.error("No rates selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedItems.length} selected TA-MA rates?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedItems.map((id) => Tamarate.delete(id)));
        await loadAllRates();
        setSelectedItems([]);
        toast.success(`${selectedItems.length} rates deleted successfully!`);
      } catch (error) {
        toast.error("Failed to delete some rates");
      }
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setCurrentPage(1);
    loadAllRates();
    toast.success("Data refreshed!");
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

  const formatCurrency = (amount) => {
    if (!amount) return "0.00";
    return parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const StatCard = ({ title, value, subValue, icon: Icon, color }) => {
    const colorClasses = {
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
        className={`bg-white rounded-xl border ${colorClasses.border} p-6 hover:shadow-lg transition-all duration-200 group relative overflow-hidden`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses.light} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        ></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {subValue && (
              <p className={`text-sm font-medium ${colorClasses.text}`}>
                {subValue}
              </p>
            )}
          </div>
          <div
            className={`${colorClasses.iconBg} text-white p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header with Back Button and Dynamic Title */}
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
          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/masters/payroll-pay-structures/ta-ma-rate-master/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Rate
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Search by grade name, code, city name, grade, TA, MA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-900">
                  {selectedItems.length} rate(s) selected
                </p>
                <p className="text-sm text-red-700">
                  Bulk actions available for selected items
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 flex items-center transition-all"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedItems.length})
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rates Table */}
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
                        selectedItems.length == displayedRates.length &&
                        displayedRates.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(
                            displayedRates.map((r) => r.ta_ma_rate_id),
                          );
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee Grade
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  City Grade
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  TA Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  MA Amount
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
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading TA-MA rates...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : displayedRates.length > 0 ? (
                displayedRates.map((rate) => {
                  const empGrade = rate.emp_grade;
                  const cityGrade = rate.city_grade;

                  return (
                    <tr
                      key={rate.ta_ma_rate_id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/masters/payroll-pay-structures/ta-ma-rate-master/view/${rate.ta_ma_rate_id}`,
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
                            checked={selectedItems.includes(rate.ta_ma_rate_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([
                                  ...selectedItems,
                                  rate.ta_ma_rate_id,
                                ]);
                              } else {
                                setSelectedItems(
                                  selectedItems.filter(
                                    (id) => id != rate.ta_ma_rate_id,
                                  ),
                                );
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <Award className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {empGrade?.EGM_Name || "N/A"}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mt-0.5">
                              <Hash className="h-3 w-3 mr-1" />
                              <span>{empGrade?.EGM_Code || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Building className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {cityGrade?.City_Name || "N/A"}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mt-0.5">
                              <span>Grade: {cityGrade?.Grade || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="font-semibold">
                            ₹ {formatCurrency(rate.TA)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-blue-600">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="font-semibold">
                            ₹ {formatCurrency(rate.MA)}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/payroll-pay-structures/ta-ma-rate-master/view/${rate.ta_ma_rate_id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View rate details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/payroll-pay-structures/ta-ma-rate-master/edit/${rate.ta_ma_rate_id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                            title="Edit rate"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRate(
                                rate.ta_ma_rate_id,
                                empGrade?.EGM_Name || "Unknown Grade",
                                cityGrade?.City_Name || "Unknown City",
                              );
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete rate"
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
                        <DollarSign className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No rates found"
                          : "No TA-MA rates configured yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "No rates match your search criteria. Try adjusting your search term."
                          : "Get started by creating your first TA-MA rate configuration."}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/payroll-pay-structures/ta-ma-rate-master/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Rate
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

      {/* Pagination & Footer */}
      {displayedRates.length > 0 && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredRates.length)} of{" "}
                {filteredRates.length} rates
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
                        ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage == totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TamarateList;
