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
  Key,
  Copy,
  Search,
  RefreshCw,
  ArrowRight,
  ChevronRight,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import AreaMasterApi from "../../../services/areamasterapi";

const AreaList = ({ user }) => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [sortField, setSortField] = useState("Are_Name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pageTitle, setPageTitle] = useState("Area Master");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/organization-management/area-master";

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
    loadAreas();
  }, [currentPage]);

  const loadAreas = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };

      const response = await AreaMasterApi.getAll(params);

      if (response.success) {
        let areasData = Array.isArray(response.data) ? response.data : [];

        // Filter: Only show areas where the associated ward is active (is_active ==  true)
        areasData = areasData.filter((area) => {
          // Check if area has ward and ward is active
          return area.ward.Is_Active == true;
        });

        setAreas(areasData);
        setTotalItems(areasData.length);
        setTotalPages(Math.ceil(areasData.length / itemsPerPage) || 1);
        setSelectedAreas([]); // Fixed: was setSelectedWards, now setSelectedAreas

        // If filtered data length is 0 and we're not on page 1, reset to page 1
        if (areasData.length == 0 && currentPage != 1) {
          setCurrentPage(1);
        }
      } else {
        toast.error(response.message || "Failed to load areas");
        setAreas([]);
      }
    } catch (error) {
      toast.error("Failed to load areas");
      console.error(error);
      setAreas([]);
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

  const filteredAreas = areas.filter((area) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      area.Are_Code?.toLowerCase().includes(searchLower) ||
      area.Are_Name?.toLowerCase().includes(searchLower) ||
      area.ward?.Wrd_Name?.toLowerCase().includes(searchLower) ||
      area.ward?.Wrd_Code?.toLowerCase().includes(searchLower)
    );
  });

  const sortedAreas = [...filteredAreas].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection == "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection == "asc" ? 1 : -1;
    return 0;
  });

  const paginatedAreas = sortedAreas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDeleteArea = async (areaId, areaName) => {
    const result = await Swal.fire({
      title: "Delete Area?",
      text: `Are you sure you want to delete "${areaName}"? This action cannot be undone.`,
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
        const response = await AreaMasterApi.delete(areaId);
        if (response.success) {
          await loadAreas();
          toast.success(`Area "${areaName}" deleted successfully!`);
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        toast.error("Failed to delete area");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAreas.length == 0) {
      toast.error("No areas selected");
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedAreas.length} selected areas?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(selectedAreas.map((id) => AreaMasterApi.delete(id)));
        await loadAreas();
        setSelectedAreas([]);
        toast.success(`${selectedAreas.length} areas deleted successfully!`);
      } catch (error) {
        toast.error("Failed to delete some areas");
      }
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  return (
    <div className="p-6">
      {/* Header - Enhanced with pageTitle */}
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
            <p className="text-gray-600 mt-1">
              Manage geographical areas within wards
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/masters/organization-management/area-master/create"
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New Area
          </Link>
        </div>
      </div>

      {/* Action Bar - Enhanced */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search areas by code, name, or ward..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadAreas}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions - Enhanced */}
        {selectedAreas.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedAreas.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedAreas.length} area(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected areas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedAreas([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedAreas.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Areas Table - Enhanced */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500 focus:ring-offset-0"
                      checked={
                        selectedAreas.length == paginatedAreas.length &&
                        paginatedAreas.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAreas(paginatedAreas.map((a) => a.Are_Id));
                        } else {
                          setSelectedAreas([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Are_Name")}
                >
                  <div className="flex items-center">
                    Area Details
                    {sortField == "Are_Name" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                  onClick={() => handleSort("Are_Code")}
                >
                  <div className="flex items-center">
                    Code
                    {sortField == "Are_Code" && (
                      <span className="ml-1 text-green-600">
                        {sortDirection == "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ward
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
                      <p className="mt-4 text-gray-600">Loading areas...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedAreas.length > 0 ? (
                paginatedAreas.map((area) => (
                  <tr
                    key={area.Are_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons")
                      ) {
                        navigate(
                          `/masters/organization-management/area-master/view/${area.Are_Id}`,
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
                          className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500 focus:ring-offset-0"
                          checked={selectedAreas.includes(area.Are_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAreas([...selectedAreas, area.Are_Id]);
                            } else {
                              setSelectedAreas(
                                selectedAreas.filter((id) => id != area.Are_Id),
                              );
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-sm">
                            {area.Are_Name?.charAt(0) || "A"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-150">
                            {area.Are_Name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200">
                          <Key className="h-3 w-3 mr-1.5" />
                          {area.Are_Code}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(area.Are_Code);
                          }}
                          className="ml-2 p-1 hover:bg-green-50 rounded transition-colors duration-150"
                          title="Copy Code"
                        >
                          <Copy className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {area.ward?.Wrd_Name || "N/A"}
                          </span>
                        </div>
                        {area.ward?.Wrd_Code && (
                          <div className="text-xs text-gray-500 mt-1">
                            Code: {area.ward.Wrd_Code}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {area.Is_Active == true ? (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1.5" />
                            Active
                          </span>
                        </div>
                      ) : area.Is_Active == false ? (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200">
                            <XCircle className="h-3 w-3 mr-1.5" />
                            Inactive
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200">
                            <AlertCircle className="h-3 w-3 mr-1.5" />
                            Unknown
                          </span>
                        </div>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/masters/organization-management/area-master/view/${area.Are_Id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/masters/organization-management/area-master/edit/${area.Are_Id}`}
                          className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteArea(area.Are_Id, area.Are_Name);
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
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
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <MapPin className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No matching areas found"
                          : "No active areas available"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? `No areas match "${searchTerm}". Try a different search term.`
                          : "Areas are only visible when their associated ward is active. Please activate the ward first to manage its areas."}
                      </p>
                      {searchTerm ? (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="inline-flex items-center px-5 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-all duration-200"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Clear Search
                        </button>
                      ) : (
                        <Link
                          to="/masters/organization-management/ward-master"
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Building className="h-4 w-4 mr-2" />
                          View Active Wards
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

      {/* Pagination - Enhanced */}
      {sortedAreas.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              areas
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
                      ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-sm"
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

export default AreaList;
