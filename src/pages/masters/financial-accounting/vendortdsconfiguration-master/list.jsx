// src/pages/Masters/FinancialAccounting/VendorTDSConfiguration/list.jsx
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
  ArrowLeft,
  Calendar,
  Percent,
  User,
  Building,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { VendorTDSConfigurationApi } from "../../../services/vendortdsconfigurationapi";

const VendorTDSConfigurationList = ({ user }) => {
  const [tdsConfigs, setTdsConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFY, setFilterFY] = useState("");
  const [filterVendor, setFilterVendor] = useState("");
  const [financialYears, setFinancialYears] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedConfigs, setSelectedConfigs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [pageTitle, setPageTitle] = useState("Vendor TDS Configuration");
  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/masters/financial-accounting/vendortdsconfiguration-master";

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
    loadDropdownData();
  }, []);

  useEffect(() => {
    loadTDSConfigs();
  }, [currentPage, searchTerm, filterFY, filterVendor]);

  const loadDropdownData = async () => {
    try {
      const [years, vendorList] = await Promise.all([
        VendorTDSConfigurationApi.getFinancialYears(),
        VendorTDSConfigurationApi.getVendors(),
      ]);
      setFinancialYears(years || []);
      setVendors(vendorList || []);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
    }
  };

  const loadTDSConfigs = async () => {
    setLoading(true);
    try {
      const result = await VendorTDSConfigurationApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        filterFY,
        filterVendor,
      );

      setTdsConfigs(result.tdsConfigs || []);
      setTotalPages(result.pagination?.last_page || 1);
      setTotalItems(result.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading TDS configurations:", error);
      toast.error("Failed to load TDS configurations");
      setTdsConfigs([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete TDS Configuration?",
      text: `Are you sure you want to delete this TDS configuration? This action cannot be undone.`,
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
      await VendorTDSConfigurationApi.delete(id);
      await loadTDSConfigs();
      toast.success(`TDS configuration deleted successfully!`);
      setSelectedConfigs(
        selectedConfigs.filter((selectedId) => selectedId != id),
      );
    } catch (error) {
      console.error("Error deleting TDS configuration:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete TDS configuration",
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedConfigs.length == 0) {
      toast.error("No TDS configurations selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedConfigs.length} selected TDS configurations?`,
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
        const deletePromises = selectedConfigs.map((id) =>
          VendorTDSConfigurationApi.delete(id),
        );
        await Promise.all(deletePromises);

        await loadTDSConfigs();
        setSelectedConfigs([]);
        toast.success(
          `${selectedConfigs.length} TDS configuration(s) deleted successfully!`,
        );
      } catch (error) {
        console.error("Error in bulk delete:", error);
        toast.error("Failed to delete some TDS configurations");
        await loadTDSConfigs();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterFY("");
    setFilterVendor("");
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getVendorName = (slId) => {
    const vendor = vendors.find((v) => v.SL_Id == slId);
    return vendor ? vendor.SL_Name : "N/A";
  };

  const getFYName = (fyId) => {
    const fy = financialYears.find((f) => f.FY_Id == fyId);
    return fy ? fy.FY_Name : "N/A";
  };

  const getStatusBadge = (isActive) => {
    console.log("isActive");
    console.log(isActive);
    if (isActive == "Y") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </span>
      );
    }
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
              Manage vendor TDS configuration and rates
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadTDSConfigs}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>

          <Link
            to="/masters/financial-accounting/vendortdsconfiguration-master/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New TDS Configuration
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Financial Year
              </label>
              <select
                value={filterFY}
                onChange={(e) => {
                  setFilterFY(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Financial Years</option>
                {financialYears.map((fy) => (
                  <option key={fy.FY_Id} value={fy.FY_Id}>
                    {fy.FY_Name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <select
                value={filterVendor}
                onChange={(e) => {
                  setFilterVendor(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor.SL_Id} value={vendor.SL_Id}>
                    {vendor.SL_Name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vendor name, remark..."
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
        {selectedConfigs.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {selectedConfigs.length} configuration(s) selected
            </span>
            <button
              onClick={handleBulkDelete}
              disabled={loading}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Deleting..." : "Delete Selected"}
            </button>
            <button
              onClick={() => setSelectedConfigs([])}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* TDS Configurations Table */}
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
                      selectedConfigs.length == tdsConfigs.length &&
                      tdsConfigs.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedConfigs(tdsConfigs.map((t) => t.VTC_Id));
                      } else {
                        setSelectedConfigs([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor & TDS Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Financial Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              ) : tdsConfigs.length > 0 ? (
                tdsConfigs.map((config) => (
                  <tr
                    key={config.VTC_Id}
                    className="hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/financial-accounting/vendortdsconfiguration-master/view/${config.VTC_Id}`,
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
                        checked={selectedConfigs.includes(config.VTC_Id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedConfigs([
                              ...selectedConfigs,
                              config.VTC_Id,
                            ]);
                          } else {
                            setSelectedConfigs(
                              selectedConfigs.filter(
                                (id) => id != config.VTC_Id,
                              ),
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {config.sub_ledger?.SL_Name ||
                              getVendorName(config.SL_Id)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Percent className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600">
                            TDS Rate:{" "}
                            <span className="font-semibold">
                              {config.TDS_rate}%
                            </span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {config.financial_year?.FY_Name ||
                            getFYName(config.FY_Id)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(config.Is_Active)}
                    </td>
                    <td className="px-6 py-4 action-buttons">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/masters/financial-accounting/vendortdsconfiguration-master/view/${config.VTC_Id}`}
                          className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/financial-accounting/vendortdsconfiguration-master/edit/${config.VTC_Id}`}
                          className="text-purple-600 hover:text-purple-900 p-1.5 hover:bg-purple-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(config.VTC_Id);
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
                        No TDS configurations found
                      </p>
                      <p className="text-sm mb-4">
                        {searchTerm || filterFY || filterVendor
                          ? "Try adjusting your search or filters"
                          : "Get started by creating your first TDS configuration"}
                      </p>
                      {!searchTerm && !filterFY && !filterVendor && (
                        <Link
                          to="/masters/financial-accounting/vendortdsconfiguration-master/create"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create TDS Configuration
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

export default VendorTDSConfigurationList;
