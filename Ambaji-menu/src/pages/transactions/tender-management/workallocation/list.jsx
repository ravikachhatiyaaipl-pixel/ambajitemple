import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Hash,
  DollarSign,
  Calendar,
  ArrowLeft,
  Upload,
  Briefcase,
  Users,
  Building,
  Layers,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { WorkAllocationApi } from "../../../services/workallocationapi";

const WorkAllocationList = ({ user }) => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedAllocations, setSelectedAllocations] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageTitle, setPageTitle] = useState("Work Allocation Management");

  const navigate = useNavigate();

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/tender-management/workallocation";

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
    loadAllocations();
  }, [currentPage, searchTerm]);

  const loadAllocations = async () => {
    setLoading(true);
    try {
      const result = await WorkAllocationApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
      );
      console.log("API Response:", result);

      setAllocations(result.allocations || []);
      setTotalPages(result.pagination?.last_page || 1);
      setTotalItems(result.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading work allocations:", error);
      toast.error("Failed to load work allocations");
      setAllocations([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllocation = async (allocationId) => {
    const result = await Swal.fire({
      title: "Delete Work Allocation?",
      text: `Are you sure you want to delete this allocation? This action cannot be undone.`,
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
      await WorkAllocationApi.delete(allocationId);
      await loadAllocations();
      toast.success(`Work allocation deleted successfully!`);
      setSelectedAllocations(
        selectedAllocations.filter((id) => id != allocationId),
      );
    } catch (error) {
      console.error("Error deleting work allocation:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete work allocation");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAllocations.length == 0) {
      toast.error("No work allocations selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedAllocations.length} selected allocations?`,
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
        const deletePromises = selectedAllocations.map((id) =>
          WorkAllocationApi.delete(id),
        );
        await Promise.all(deletePromises);
        await loadAllocations();
        setSelectedAllocations([]);
        toast.success(
          `${selectedAllocations.length} work allocation(s) deleted successfully!`,
        );
      } catch (error) {
        console.error("Error in bulk delete:", error);
        toast.error("Failed to delete some work allocations");
        await loadAllocations();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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

  // Helper function to get department display name
  const getDepartmentDisplay = (department) => {
    if (!department) return "N/A";

    if (department.Dpt_Desc) {
      return department.Dpt_Desc;
    }
    if (department.Dpt_Name) {
      return department.Dpt_Name;
    }
    return `Dept #${department.Dpt_id}`;
  };

  // Helper function to get ledger display name
  const getLedgerDisplay = (ledger) => {
    if (!ledger) return "N/A";

    let display = ledger.Lg_Name || "";

    if (ledger.Lg_Eng_Name && ledger.Lg_Eng_Name != ledger.Lg_Name) {
      display += ` (${ledger.Lg_Eng_Name})`;
    }

    if (ledger.Lg_Code) {
      display += ` - ${ledger.Lg_Code}`;
    }

    return display;
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
              Manage and track work allocations to vendors
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/transactions/tender-management/workallocation/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Allocate Work
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tender description, vendor name, reference ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Bulk Selection Actions */}
      {selectedAllocations.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-3">
          <span className="text-sm font-medium text-blue-800">
            {selectedAllocations.length} allocation(s) selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
          >
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedAllocations([])}
            className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Allocations Table */}
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
                      selectedAllocations.length == allocations.length &&
                      allocations.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAllocations(allocations.map((a) => a.WA_Id));
                      } else {
                        setSelectedAllocations([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch / Ledger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tender Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocation Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : allocations.length > 0 ? (
                allocations.map((item) => {
                  const tender = item.tender;
                  const vendor = item.subledger;
                  const department = item.department;
                  const ledger = item.ledger;

                  return (
                    <tr
                      key={item.WA_Id}
                      className="hover:bg-gray-50 transition-colors"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/transactions/tender-management/workallocation/view/${item.WA_Id}`,
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
                          checked={selectedAllocations.includes(item.WA_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAllocations([
                                ...selectedAllocations,
                                item.WA_Id,
                              ]);
                            } else {
                              setSelectedAllocations(
                                selectedAllocations.filter(
                                  (id) => id != item.WA_Id,
                                ),
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="font-medium text-gray-900">
                            {formatDate(item.WO_Date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {/* Branch/Department */}
                          <div className="flex items-start">
                            <Building className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-gray-500">
                                Branch
                              </div>
                              <div className="text-sm text-gray-900">
                                {department
                                  ? getDepartmentDisplay(department)
                                  : "N/A"}
                              </div>
                            </div>
                          </div>

                          {/* Ledger */}
                          <div className="flex items-start">
                            <Layers className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs font-medium text-gray-500">
                                Ledger
                              </div>
                              <div className="text-sm text-gray-900">
                                {ledger ? getLedgerDisplay(ledger) : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {tender ? (
                            <>
                              <div className="font-medium text-gray-900">
                                {tender.Description || "No Description"}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Amount: {formatCurrency(tender.Proposal_Amount)}
                                {tender.Approved_Amount && (
                                  <span className="ml-2 text-green-600">
                                    (Approved:{" "}
                                    {formatCurrency(tender.Approved_Amount)})
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">
                              No tender assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {vendor ? (
                            <>
                              <div className="font-medium text-gray-900">
                                {vendor.SL_Name || "Unknown Vendor"}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">
                              No vendor assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {item.WO_Amount ? (
                            <div className="text-sm font-semibold text-blue-600">
                              {formatCurrency(item.WO_Amount)}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">
                              No amount
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 action-buttons">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/transactions/tender-management/workallocation/view/${item.WA_Id}`}
                            className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/transactions/tender-management/workallocation/edit/${item.WA_Id}`}
                            className="text-purple-600 hover:text-purple-900 p-1.5 hover:bg-purple-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAllocation(item.WA_Id);
                            }}
                            className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded transition-colors"
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
                    <div className="text-gray-500">
                      <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium mb-1">
                        No work allocations found
                      </p>
                      <p className="text-sm mb-4">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by allocating your first work"}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/transactions/tender-management/workallocation/create"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Allocate First Work
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
      {totalPages > 1 && (
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
      )}
    </div>
  );
};

export default WorkAllocationList;
