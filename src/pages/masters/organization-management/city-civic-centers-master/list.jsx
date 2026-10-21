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
  Home,
  MapPin,
  Building,
  CheckCircle,
  RefreshCw,
  ChevronRight,
  Copy,
  AlertCircle,
  Check,
  X,
  Trash,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import CccsApi from "../../../services/cccsapi";

const CCCList = ({ user }) => {
  const [cccs, setCccs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCccs, setSelectedCccs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [pageTitle, setPageTitle] = useState(
    "Citizen Collection Center (CCC) Master",
  );

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath =
        "/masters/organization-management/city-civic-centers-master";

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
    loadCccs();
  }, [currentPage]);

  const loadCccs = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };

      const response = await CccsApi.getAll(params);

      if (response.success && response.data) {
        const cccsData = response.data.data || [];
        setCccs(cccsData);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.last_page || 1);
        setSelectedCccs([]);
      } else {
        toast.error(response.message || "Failed to load CCCs");
      }
    } catch (error) {
      console.error("Error loading CCCs:", error);
      toast.error("Failed to load CCCs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCcc = async (cccId, cccName) => {
    const result = await Swal.fire({
      title: "Delete CCC?",
      text: `Are you sure you want to delete "${cccName}"? This action cannot be undone.`,
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
        const response = await CccsApi.delete(cccId);
        if (response.success) {
          await loadCccs();
          toast.success(`CCC "${cccName}" deleted successfully!`);
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Error deleting CCC:", error);
        toast.error(error.message || "Failed to delete CCC");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCccs.length == 0) {
      toast.error("Please select CCCs to delete");
      return;
    }

    const selectedCccNames = cccs
      .filter((ccc) => selectedCccs.includes(ccc.CCC_Id))
      .map((ccc) => ccc.CCC_Name);

    const result = await Swal.fire({
      title: "Delete Selected CCCs?",
      html: `
        <div class="text-left">
          <p class="mb-3">Are you sure you want to delete ${selectedCccs.length} selected CCC(s)?</p>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-2 max-h-32 overflow-y-auto">
            <p class="text-sm font-medium text-red-800 mb-1">Selected CCCs:</p>
            <ul class="text-sm text-red-700 space-y-1">
              ${selectedCccNames.map((name) => `<li>• ${name}</li>`).join("")}
            </ul>
          </div>
          <p class="mt-3 text-sm text-red-600 font-medium">This action cannot be undone!</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, delete ${selectedCccs.length} CCC(s)!`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setBulkDeleting(true);
      try {
        const deletePromises = selectedCccs.map((cccId) =>
          CccsApi.delete(cccId).catch((error) => {
            console.error(`Error deleting CCC ${cccId}:`, error);
            return { success: false, cccId, error };
          }),
        );

        const results = await Promise.all(deletePromises);
        const successfulDeletes = results.filter((r) => r && r.success).length;
        const failedDeletes = results.filter((r) => r && !r.success).length;

        if (failedDeletes == 0) {
          toast.success(`Successfully deleted ${successfulDeletes} CCC(s)!`);
        } else if (successfulDeletes > 0) {
          toast.success(
            `Deleted ${successfulDeletes} CCC(s). ${failedDeletes} deletion(s) failed.`,
          );
        } else {
          toast.error("Failed to delete selected CCCs");
        }

        await loadCccs();
      } catch (error) {
        console.error("Error in bulk delete:", error);
        toast.error("Failed to delete selected CCCs");
      } finally {
        setBulkDeleting(false);
      }
    }
  };
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCccs(cccs.map((ccc) => ccc.CCC_Id));
    } else {
      setSelectedCccs([]);
    }
  };

  const handleSelectCcc = (cccId, checked) => {
    if (checked) {
      setSelectedCccs((prev) => [...prev, cccId]);
    } else {
      setSelectedCccs((prev) => prev.filter((id) => id != cccId));
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const getZoneDisplay = (ward) => {
    if (ward?.zone) {
      return {
        name: ward.zone.Zon_Name,
        code: ward.zone.Zon_Code,
      };
    }
    return null;
  };

  const stats = {
    totalCccs: totalItems,
    activeCccs: cccs.filter((c) => c.is_active).length,
    wardsCount: new Set(cccs.map((c) => c.Wrd_Id)).size,
  };

  return (
    <div className="p-6">
      {/* Header - WITH pageTitle from menu details */}
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
            to="/masters/organization-management/city-civic-centers-master/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add New CCC
          </Link>
        </div>
      </div>

      {/* Action Bar - Enhanced */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700">
              Total: {totalItems} CCC(s)
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadCccs}
              className="group px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-all duration-200"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar - Enhanced */}
        {selectedCccs.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedCccs.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedCccs.length} CCC(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected CCCs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedCccs([])}
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
                    Delete Selected ({selectedCccs.length})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CCCs Table - Enhanced with row click navigation */}
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
                        selectedCccs.length > 0 &&
                        selectedCccs.length == cccs.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  CCC Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ward & Zone Information
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th> */}
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
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading CCCs...</p>
                    </div>
                  </td>
                </tr>
              ) : cccs.length > 0 ? (
                cccs.map((ccc) => {
                  const zoneDisplay = getZoneDisplay(ccc.ward);

                  return (
                    <tr
                      key={ccc.CCC_Id}
                      className="hover:bg-gray-50 transition-colors duration-150 group"
                      onClick={(e) => {
                        if (
                          !e.target.closest('input[type="checkbox"]') &&
                          !e.target.closest(".action-buttons")
                        ) {
                          navigate(
                            `/masters/organization-management/city-civic-centers-master/view/${ccc.CCC_Id}`,
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
                            checked={selectedCccs.includes(ccc.CCC_Id)}
                            onChange={(e) =>
                              handleSelectCcc(ccc.CCC_Id, e.target.checked)
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <Home className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-150">
                              {ccc.CCC_Name}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-500 mr-2">
                                Code:
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {ccc.CCC_Code || "—"}
                              </span>
                              {ccc.CCC_Code && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyCode(ccc.CCC_Code);
                                  }}
                                  className="ml-1 p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Copy Code"
                                >
                                  <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {ccc.ward ? (
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">
                                  {ccc.ward.Wrd_Name}
                                </span>
                              </div>
                            </div>
                            {zoneDisplay && (
                              <div>
                                <div className="flex items-center">
                                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {zoneDisplay.name}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 ml-6">
                                  Zone Code: {zoneDisplay.code}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No ward assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              ccc.Is_Active
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ccc.Is_Active ? (
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
                      {/* <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(ccc.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(ccc.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td> */}
                      <td
                        className="px-6 py-4 action-buttons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/masters/organization-management/city-civic-centers-master/view/${ccc.CCC_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/masters/organization-management/city-civic-centers-master/edit/${ccc.CCC_Id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-150"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCcc(ccc.CCC_Id, ccc.CCC_Name);
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Home className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No CCCs found
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        Get started by adding your first Citizen Collection
                        Center
                      </p>
                      <Link
                        to="/masters/organization-management/city-civic-centers-master/create"
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First CCC
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Enhanced */}
      {cccs.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              CCCs
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

export default CCCList;
