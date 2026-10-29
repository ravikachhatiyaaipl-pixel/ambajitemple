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
  Shield,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  DollarSign,
  Calendar,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EmpGroupInsuranceApi from "../../../services/empgroupinsuranceapi";
import PayCommissionApi from "../../../services/paycommissionapi";

const EmpGroupInsuranceList = ({ user }) => {
  const navigate = useNavigate();
  const [insurances, setInsurances] = useState([]);
  const [allInsurances, setAllInsurances] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedInsurances, setSelectedInsurances] = useState([]);
  const [sortField, setSortField] = useState("EGI_Id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("Employee Group Insurance");
  const [initialLoad, setInitialLoad] = useState(true);
  const [filterCommission, setFilterCommission] = useState("all");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/employee-records/emp-group-insurance";
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
    loadCommissions();
    loadAllInsurances();
  }, []);

  useEffect(() => {
    if (!initialLoad && allInsurances.length > 0) {
      applyFiltersAndPagination();
    }
  }, [
    searchTerm,
    currentPage,
    sortField,
    sortDirection,
    filterCommission,
    allInsurances,
    initialLoad,
  ]);

  const loadCommissions = async () => {
    try {
      const response = await PayCommissionApi.getAllList();
      if (response.success) {
        setCommissions(response.data || []);
      } else if (Array.isArray(response)) {
        setCommissions(response);
      }
    } catch (error) {
      console.error("Error loading commissions:", error);
    }
  };

  const loadAllInsurances = async () => {
    setLoading(true);
    try {
      const response = await EmpGroupInsuranceApi.getAll();

      console.log("Full API Response:", response);

      let insuranceData = [];

      if (response && response.success == true) {
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          insuranceData = response.data.data;
          console.log("Extracted insurances:", insuranceData);
        } else if (response.data && Array.isArray(response.data)) {
          insuranceData = response.data;
        } else if (Array.isArray(response)) {
          insuranceData = response;
        }
      }

      setAllInsurances(insuranceData);
      setInitialLoad(false);

      if (insuranceData.length > 0) {
        applyFiltersAndPagination();
      }
    } catch (error) {
      console.error("Error loading insurances:", error);
      toast.error(error.message || "Failed to load insurance data");
      setAllInsurances([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndPagination = () => {
    const insuranceArray = Array.isArray(allInsurances) ? allInsurances : [];

    let filteredData = [...insuranceArray];

    if (searchTerm && searchTerm.trim() != "") {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredData = filteredData.filter(
        (insurance) =>
          insurance.Group_Type?.toLowerCase().includes(searchLower) ||
          insurance.EGI_Id?.toString().includes(searchLower) ||
          (insurance.pay_commission?.PC_Name || "")
            .toLowerCase()
            .includes(searchLower) ||
          insurance.Insurance_Amt?.toString().includes(searchLower) ||
          insurance.Save_Amt?.toString().includes(searchLower) ||
          insurance.Effective_Date?.includes(searchLower),
      );
    }

    if (filterCommission != "all") {
      filteredData = filteredData.filter(
        (insurance) => insurance.PC_Id == filterCommission,
      );
    }

    filteredData.sort((a, b) => {
      let aValue, bValue;

      if (sortField == "commission_name") {
        aValue = a.pay_commission?.PC_Name || "";
        bValue = b.pay_commission?.PC_Name || "";
      } else if (sortField == "Insurance_Amt" || sortField == "Save_Amt") {
        aValue = parseFloat(a[sortField]) || 0;
        bValue = parseFloat(b[sortField]) || 0;
      } else if (sortField == "Effective_Date") {
        aValue = new Date(a[sortField]) || new Date(0);
        bValue = new Date(b[sortField]) || new Date(0);
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

    setInsurances(paginatedData);
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

  const handleDelete = async (id, groupType) => {
    const result = await Swal.fire({
      title: "Delete Insurance?",
      text: `Are you sure you want to delete "${groupType}"? This action cannot be undone.`,
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
        await EmpGroupInsuranceApi.delete(id);

        const response = await EmpGroupInsuranceApi.getAll();
        if (response && response.success == true) {
          const insuranceData = response.data?.data || [];
          setAllInsurances(insuranceData);
        }

        toast.success(`Insurance "${groupType}" deleted successfully!`);

        if (insurances.length == 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        toast.error("Failed to delete insurance");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedInsurances.length == 0) {
      toast.error("No items selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedInsurances.length} selected items?`,
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
          selectedInsurances.map((id) => EmpGroupInsuranceApi.delete(id)),
        );

        const response = await EmpGroupInsuranceApi.getAll();
        if (response.success) {
          setAllInsurances(response.data || []);
        }

        setSelectedInsurances([]);
        toast.success(
          `${selectedInsurances.length} items deleted successfully!`,
        );

        const remainingCount = allInsurances.length - selectedInsurances.length;
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
      const response = await EmpGroupInsuranceApi.getAll();
      if (response && response.success == true) {
        const insuranceData = response.data?.data || [];
        setAllInsurances(insuranceData);
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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
              Manage employee group insurance policies
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/masters/employee-records/emp-group-insurance/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Insurance
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by group Code, commission, amount..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filterCommission}
              onChange={(e) => {
                setFilterCommission(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
            >
              <option value="all">All Commissions</option>
              {commissions.map((comm) => (
                <option key={comm.PC_Id} value={comm.PC_Id}>
                  {comm.PC_Name}
                </option>
              ))}
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

        {selectedInsurances.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedInsurances.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedInsurances.length} item(s) selected
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
                onClick={() => setSelectedInsurances([])}
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
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
                      checked={
                        selectedInsurances.length == insurances.length &&
                        insurances.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInsurances(
                            insurances.map((s) => s.EGI_Id),
                          );
                        } else {
                          setSelectedInsurances([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Group_Type")}
                >
                  <div className="flex items-center">
                    Group Code
                    {sortField == "Group_Type" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("commission_name")}
                >
                  <div className="flex items-center">
                    Pay Commission
                    {sortField == "commission_name" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Effective_Date")}
                >
                  <div className="flex items-center">
                    Effective Date
                    {sortField == "Effective_Date" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Insurance_Amt")}
                >
                  <div className="flex items-center">
                    Insurance Amount
                    {sortField == "Insurance_Amt" && (
                      <span className="ml-1 text-blue-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Save_Amt")}
                >
                  <div className="flex items-center">
                    Savings Amount
                    {sortField == "Save_Amt" && (
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">
                        Loading insurance data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : insurances.length > 0 ? (
                insurances.map((insurance) => {
                  return (
                    <tr
                      key={insurance.EGI_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/masters/employee-records/emp-group-insurance/view/${insurance.EGI_Id}`,
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
                            checked={selectedInsurances.includes(
                              insurance.EGI_Id,
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedInsurances([
                                  ...selectedInsurances,
                                  insurance.EGI_Id,
                                ]);
                              } else {
                                setSelectedInsurances(
                                  selectedInsurances.filter(
                                    (id) => id != insurance.EGI_Id,
                                  ),
                                );
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {insurance.Group_Type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {insurance.pay_commission?.PC_Name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {formatDate(insurance.Effective_Date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(insurance.Insurance_Amt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Wallet className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {formatCurrency(insurance.Save_Amt)}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/employee-records/emp-group-insurance/view/${insurance.EGI_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/employee-records/emp-group-insurance/edit/${insurance.EGI_Id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(
                                insurance.EGI_Id,
                                insurance.Group_Type,
                              );
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterCommission != "all"
                          ? "No insurance records found"
                          : "No insurance records yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm || filterCommission != "all"
                          ? "No items match your search criteria. Try adjusting your search term or filters."
                          : "Get started by creating your first employee group insurance record."}
                      </p>
                      {!searchTerm && filterCommission == "all" && (
                        <Link
                          to="/masters/employee-records/emp-group-insurance/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Insurance Record
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
            {searchTerm || filterCommission != "all" ? (
              <span className="text-sm text-gray-500">
                (filtered from {allInsurances.length} total)
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

export default EmpGroupInsuranceList;
