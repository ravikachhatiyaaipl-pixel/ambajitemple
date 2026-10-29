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
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Building,
  CheckCircle,
  Copy,
  Map,
  Trash,
  AlertCircle,
  Check,
  ArrowRight,
  ChevronRight,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import WardsApi from "../../../services/wardsapi";

const WardList = ({ user }) => {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedWards, setSelectedWards] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [pageTitle, setPageTitle] = useState("Ward Master");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [allFilteredWards, setAllFilteredWards] = useState([]); // Store all filtered wards

  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/organization-management/ward-master";
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

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    loadAllWards();
  }, [debouncedSearch]);

  const loadAllWards = async () => {
    setLoading(true);
    try {
      // Fetch all wards without pagination to filter properly
      const params = {
        per_page: 1000, // Fetch a large number to get all data
      };

      // Add search query to params if it exists
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await WardsApi.getAll(params);

      if (response.success && response.data) {
        let wardsData = response.data.data || [];

        // Filter: Only show wards where the associated zone is active (Is_Active ==  true)
        wardsData = wardsData.filter((ward) => {
          // Check if ward has zone and zone is active
          return ward.zone && ward.zone.Is_Active == true;
        });

        // Store all filtered wards
        setAllFilteredWards(wardsData);

        // Update total items based on filtered data
        setTotalItems(wardsData.length);
        setTotalPages(Math.ceil(wardsData.length / itemsPerPage));

        // Get current page data
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedWards = wardsData.slice(startIndex, endIndex);

        setWards(paginatedWards);
        setSelectedWards([]);

        // If filtered data length is 0 and we're not on page 1, reset to page 1
        if (wardsData.length == 0 && currentPage != 1) {
          setCurrentPage(1);
        }
      } else {
        toast.error(response.message || "Failed to load wards");
        setWards([]);
        setAllFilteredWards([]);
      }
    } catch (error) {
      console.error("Error loading wards:", error);
      toast.error("Failed to load wards");
      setWards([]);
      setAllFilteredWards([]);
    } finally {
      setLoading(false);
    }
  };

  // Update pagination when current page changes
  useEffect(() => {
    if (allFilteredWards.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedWards = allFilteredWards.slice(startIndex, endIndex);
      setWards(paginatedWards);
      setSelectedWards([]);
    }
  }, [currentPage, allFilteredWards, itemsPerPage]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
  };

  const handleDeleteWard = async (wardId, wardName) => {
    const result = await Swal.fire({
      title: "Delete Ward?",
      text: `Are you sure you want to delete "${wardName}"? This action cannot be undone.`,
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
        const response = await WardsApi.delete(wardId);
        if (response.success) {
          await loadAllWards();
          toast.success(`Ward "${wardName}" deleted successfully!`);
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Error deleting ward:", error);
        toast.error(error.message || "Failed to delete ward");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWards.length == 0) {
      toast.error("Please select wards to delete");
      return;
    }

    const result = await Swal.fire({
      title: "Delete Selected Wards?",
      html: `
        <div class="text-left">
          <p class="mb-3">Are you sure you want to delete ${selectedWards.length} selected ward(s)?</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, delete ${selectedWards.length} ward(s)!`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setBulkDeleting(true);
      try {
        const deletePromises = selectedWards.map((wardId) =>
          WardsApi.delete(wardId).catch((error) => {
            console.error(`Error deleting ward ${wardId}:`, error);
            return { success: false, wardId, error };
          }),
        );

        const results = await Promise.all(deletePromises);

        const successfulDeletes = results.filter((r) => r && r.success).length;
        const failedDeletes = results.filter((r) => r && !r.success).length;

        if (failedDeletes == 0) {
          toast.success(`Successfully deleted ${successfulDeletes} ward(s)!`);
        } else if (successfulDeletes > 0) {
          toast.success(
            `Deleted ${successfulDeletes} ward(s). ${failedDeletes} deletion(s) failed.`,
          );
        } else {
          toast.error("Failed to delete selected wards");
        }

        await loadAllWards();
      } catch (error) {
        console.error("Error in bulk delete:", error);
        toast.error("Failed to delete selected wards");
      } finally {
        setBulkDeleting(false);
      }
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedWards(wards.map((ward) => ward.Wrd_Id));
    } else {
      setSelectedWards([]);
    }
  };

  const handleSelectWard = (wardId, checked) => {
    if (checked) {
      setSelectedWards((prev) => [...prev, wardId]);
    } else {
      setSelectedWards((prev) => prev.filter((id) => id != wardId));
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const getZoneDisplay = (ward) => {
    if (ward.zone) {
      return {
        name: ward.zone.Zon_Name,
        code: ward.zone.Zon_Code,
        isActive: ward.zone.Is_Active,
        organisation: ward.zone.organisation,
      };
    }
    return null;
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
            to="/masters/organization-management/ward-master/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Ward
          </Link>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        {/* Search Bar */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search wards by name, code, or zone..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          {debouncedSearch && (
            <div className="text-sm text-gray-600">
              Searching for: "
              <span className="font-medium">{debouncedSearch}</span>"
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedWards.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedWards.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedWards.length} ward(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected wards
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedWards([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedWards.length})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wards Table */}
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
                        selectedWards.length > 0 &&
                        selectedWards.length == wards.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ward Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Zone Information
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
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading wards...</p>
                    </div>
                  </td>
                </tr>
              ) : wards.length > 0 ? (
                wards.map((ward) => {
                  const zoneDisplay = getZoneDisplay(ward);

                  return (
                    <tr
                      key={ward.Wrd_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/masters/organization-management/ward-master/view/${ward.Wrd_Id}`,
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
                            checked={selectedWards.includes(ward.Wrd_Id)}
                            onChange={(e) =>
                              handleSelectWard(ward.Wrd_Id, e.target.checked)
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-150">
                              {ward.Wrd_Name}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-500 mr-2">
                                Code:
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {ward.Wrd_Code}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyCode(ward.Wrd_Code);
                                }}
                                className="ml-1 p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Copy Code"
                              >
                                <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {zoneDisplay ? (
                          <div>
                            <div className="flex items-center">
                              <Building className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {zoneDisplay.name}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No zone assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              ward.Is_Active
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ward.Is_Active ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/organization-management/ward-master/view/${ward.Wrd_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/organization-management/ward-master/edit/${ward.Wrd_Id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWard(ward.Wrd_Id, ward.Wrd_Name);
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
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <MapPin className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchQuery
                          ? "No matching wards found"
                          : "No active wards available"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchQuery
                          ? `No wards match "${searchQuery}". Try a different search term.`
                          : "Wards are only visible when their associated zone is active. Please activate the zone first to manage its wards."}
                      </p>
                      {searchQuery ? (
                        <button
                          onClick={clearSearch}
                          className="inline-flex items-center px-5 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all duration-200"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Clear Search
                        </button>
                      ) : (
                        <Link
                          to="/masters/organization-management/zone-master"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Building className="h-4 w-4 mr-2" />
                          View Active Zones
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
      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              wards
              {debouncedSearch && (
                <span>
                  {" "}
                  matching "
                  <span className="font-medium">{debouncedSearch}</span>"
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
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
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
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

export default WardList;
