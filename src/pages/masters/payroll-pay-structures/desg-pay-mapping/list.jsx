import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Hash,
  Copy,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BadgeDollarSign,
  Scale,
  Layers,
  TrendingUp,
  Calendar,
  Clock,
  Receipt,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { DsgPayMapApi } from "../../../services/dsgpaymapapi";

const ListDsgPayMapping = ({ user }) => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedMappings, setSelectedMappings] = useState([]);
  const [sortField, setSortField] = useState("DPM_Id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [pageTitle, setPageTitle] = useState("Designation Pay Mapping");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/payroll-pay-structures/desg-pay-mapping";
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
    loadMappings();
  }, [currentPage, searchTerm]);

  const loadMappings = async () => {
    setLoading(true);
    try {
      const result = await DsgPayMapApi.getAll({
        perPage: itemsPerPage,
        page: currentPage,
        search: searchTerm,
      });

      // Check if result has data structure from API
      if (result.data && result.data.data) {
        // API returns data in { success, message, data: { data: [], pagination } } structure
        setMappings(result.data.data || []);

        // Set pagination from the nested data object
        setPagination({
          current_page: result.data.current_page || 1,
          last_page: result.data.last_page || 1,
          per_page: result.data.per_page || itemsPerPage,
          total: result.data.total || 0,
          from: result.data.from || 0,
          to: result.data.to || 0,
        });
      } else if (result.data && Array.isArray(result.data)) {
        // If API returns array directly
        setMappings(result.data);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: result.data.length,
          total: result.data.length,
          from: 1,
          to: result.data.length,
        });
      } else {
        // Fallback
        setMappings(result.data || []);
        setPagination(
          result.meta || {
            current_page: 1,
            last_page: 1,
            per_page: itemsPerPage,
            total: (result.data || []).length,
            from: 1,
            to: (result.data || []).length,
          },
        );
      }

      setSelectedMappings([]);
    } catch (error) {
      toast.error(error.message || "Failed to load mappings");
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

  const sortedMappings = [...mappings].sort((a, b) => {
    let aVal, bVal;

    if (sortField == "designation") {
      aVal = a.designation?.Dsg_Desc || "";
      bVal = b.designation?.Dsg_Desc || "";
    } else if (sortField == "commission") {
      aVal = a.commission?.PC_Name || "";
      bVal = b.commission?.PC_Name || "";
    } else {
      aVal = a[sortField];
      bVal = b[sortField];
    }

    if (aVal < bVal) return sortDirection == "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const handleDelete = async (mappingId, designationName) => {
    const result = await Swal.fire({
      title: "Delete Mapping?",
      text: `Are you sure you want to delete mapping for "${designationName}"? This action cannot be undone.`,
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
        await DsgPayMapApi.delete(mappingId);
        await loadMappings();
        toast.success(`Mapping deleted successfully!`);
      } catch (error) {
        toast.error(error.message || "Failed to delete mapping");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMappings.length == 0) {
      toast.error("No mappings selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedMappings.length} selected mappings?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Implement bulk delete if API supports it
        for (const id of selectedMappings) {
          await DsgPayMapApi.delete(id);
        }
        await loadMappings();
        setSelectedMappings([]);
        toast.success(
          `${selectedMappings.length} mappings deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some mappings");
      }
    }
  };

  const handleCopyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
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

  const formatCurrency = (value) => {
    if (!value) return "—";
    return `₹${parseFloat(value).toLocaleString()}`;
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
            to="/masters/payroll-pay-structures/desg-pay-mapping/create"
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Mapping
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
              placeholder="Search by designation, commission, scale..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                loadMappings();
              }}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedMappings.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedMappings.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-indigo-800">
                  {selectedMappings.length} mapping(s) selected
                </span>
                <p className="text-xs text-indigo-600">
                  Choose an action for selected mappings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedMappings([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedMappings.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mappings Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 focus:ring-offset-0"
                      checked={
                        selectedMappings.length == mappings.length &&
                        mappings.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMappings(mappings.map((m) => m.DPM_Id));
                        } else {
                          setSelectedMappings([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("designation")}
                >
                  <div className="flex items-center">
                    Designation
                    {sortField == "designation" && (
                      <span className="ml-1 text-indigo-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("commission")}
                >
                  <div className="flex items-center">
                    Pay Commission
                    {sortField == "commission" && (
                      <span className="ml-1 text-indigo-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Pay Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Payroll Bill
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                      <p className="mt-4 text-gray-600">Loading mappings...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedMappings.length > 0 ? (
                sortedMappings.map((mapping) => (
                  <tr
                    key={mapping.DPM_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group cursor-pointer"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/payroll-pay-structures/desg-pay-mapping/view/${mapping.DPM_Id}`,
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
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 focus:ring-offset-0"
                        checked={selectedMappings.includes(mapping.DPM_Id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMappings([
                              ...selectedMappings,
                              mapping.DPM_Id,
                            ]);
                          } else {
                            setSelectedMappings(
                              selectedMappings.filter(
                                (id) => id != mapping.DPM_Id,
                              ),
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {mapping.designation?.Dsg_Desc?.charAt(0) || "D"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">
                            {mapping.designation?.Dsg_Desc || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {mapping.commission?.PC_Name || "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {mapping.structure_type?.PST_Type || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {mapping.scale && (
                          <div className="flex items-center text-xs">
                            <Scale className="h-3 w-3 text-blue-500 mr-1" />
                            <span className="text-gray-600">
                              Scale: {mapping.scale.Scl_Code}
                            </span>
                          </div>
                        )}
                        {mapping.band && (
                          <div className="flex items-center text-xs">
                            <Layers className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-gray-600">
                              Band: {mapping.band.PB_Code}
                            </span>
                          </div>
                        )}
                        {mapping.emp_grade && (
                          <div className="flex items-center text-xs">
                            <TrendingUp className="h-3 w-3 text-amber-500 mr-1" />
                            <span className="text-gray-600">
                              Grade: {mapping.emp_grade.EGM_Name}
                              {mapping.emp_grade.pay_band &&
                                ` (${mapping.emp_grade.pay_band.PB_Code})`}
                            </span>
                          </div>
                        )}
                        {mapping.level && (
                          <div className="flex items-center text-xs">
                            <BadgeDollarSign className="h-3 w-3 text-indigo-500 mr-1" />
                            <span className="text-gray-600">
                              Level: {mapping.level.PL_Code}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {mapping.payroll_bill ? (
                        <div className="flex items-center">
                          <Receipt className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {mapping.payroll_bill.PayBill_Code}
                            </div>
                            <div className="text-xs text-gray-500">
                              {mapping.payroll_bill.Description ||
                                "No Description"}
                              {mapping.payroll_bill.ledger && (
                                <span className="block mt-0.5 text-purple-600">
                                  Ledger: {mapping.payroll_bill.ledger.Lg_Name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        {formatDate(mapping.created_at)}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        {formatTime(mapping.created_at)}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/payroll-pay-structures/desg-pay-mapping/view/${mapping.DPM_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/payroll-pay-structures/desg-pay-mapping/edit/${mapping.DPM_Id}`}
                          className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {!mapping.deleted_at && (
                          <button
                            onClick={() =>
                              handleDelete(
                                mapping.DPM_Id,
                                mapping.designation?.Dsg_Desc,
                              )
                            }
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No matching mappings found"
                          : "No mappings found"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding your first designation pay mapping"}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/masters/payroll-pay-structures/desg-pay-mapping/create"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Mapping
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

      {/* Pagination - Simple style as per image */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Showing {pagination.from || 1} to {pagination.to || 4} of{" "}
            {pagination.total || 4} items
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage == 1}
            className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-900 font-medium">1</span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))
            }
            disabled={
              currentPage == pagination.last_page || pagination.last_page <= 1
            }
            className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListDsgPayMapping;
