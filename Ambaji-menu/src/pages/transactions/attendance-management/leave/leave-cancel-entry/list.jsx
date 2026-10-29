// leave-cancel-entry/list.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Edit,
  RefreshCw,
  ArrowLeft,
  Calendar,
  FileText,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";

const LeaveCancelList = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageTitle, setPageTitle] = useState("Leave Cancel Entry");
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [userPermissions, setUserPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
  });

  const navigate = useNavigate();
  const API_BASE_URL = process.env.VITE_API_URL;

  useEffect(() => {
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);
    loadPermissions(adminCheck);
  }, [user]);

  const loadPermissions = async (adminCheck) => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]"
      );
      const currentPath =
        "/transactions/attendance-management/leave/leave-cancel-entry";
      const menuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath
      );
      
      if (menuItem) {
        setPageTitle(menuItem.Fnc_Title || "Leave Cancel Entry");
      }
      
      setUserPermissions({
        canCreate: adminCheck,
        canEdit: adminCheck,
        canDelete: adminCheck,
      });
    } catch (error) {
      console.error("Error loading permissions:", error);
    } finally {
      setPermissionsLoaded(true);
    }
  };

  useEffect(() => {
    if (permissionsLoaded) loadEntries();
  }, [currentPage, searchTerm, permissionsLoaded]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        per_page: itemsPerPage,
        page: currentPage,
        lv_mode: "C", // Only fetch cancelled leaves
      });
      
      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }
      
      const response = await axios.get(
        `${API_BASE_URL}/lst-leave-application?${queryParams.toString()}`,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      
      if (response.data && response.data.success) {
        const { data, current_page, last_page, total, per_page } = response.data.data;
        
        // Filter only cancelled leaves (Lv_Mode == "C")
        const filteredData = (data || []).filter(entry => entry.Lv_Mode == "C" || entry.lv_mode == "C" );
        
        setEntries(filteredData);
        setCurrentPage(current_page || 1);
        setTotalPages(last_page || 1);
        setTotalItems(total || 0);
        
        // Show warning if backend didn't filter properly
        if (filteredData.length !=  (data || []).length) {
          console.warn("Some non-cancelled entries were filtered out on client side");
        }
      } else {
        setEntries([]);
        toast.error(response.data?.message || "Failed to load entries");
      }
    } catch (error) {
      console.error("Error loading entries:", error);
      toast.error(error.response?.data?.message || "Failed to load leave cancel entries");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entry) => {
    const result = await Swal.fire({
      title: "Delete Leave Cancellation?",
      text: "Are you sure? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete!",
      reverseButtons: true,
    });
    
    if (!result.isConfirmed) return;
    
    try {
      // Add your delete API call here
      // await axios.delete(`${API_BASE_URL}/leave-cancel/${entry.LA_id}`);
      toast.success("Entry deleted successfully!");
      loadEntries();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // Handle the ISO date format from API (e.g., "2026-05-31T18:30:00.000000Z")
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusBadge = () => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <Clock className="h-3 w-3 mr-1" />
        Cancelled
      </span>
    );
  };

  const canEditEntry = () => {
    return isAdmin;
  };

  if (!permissionsLoaded) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading permissions...</p>
      </div>
    );
  }

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
              Manage cancelled leave applications 
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadEntries}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          {(isAdmin || userPermissions.canCreate) && (
            <Link
              to="/transactions/attendance-management/leave/leave-cancel-entry/create"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Cancellation Entry
            </Link>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name, leave type, or leave code..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {[
                  "Employee",
                  "Leave Type",
                  "Leave Period",
                  "Total Days",
                  "Cancelled Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading cancelled leaves...</p>
                  </td>
                </tr>
              ) : entries.length > 0 ? (
                entries.map((entry) => (
                  <tr
                    key={entry.LA_id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={(e) => {
                      if (!e.target.closest(".action-buttons"))
                        navigate(
                          `/transactions/attendance-management/leave/leave-cancel-entry/view/${entry.LA_id}`
                        );
                    }}
                  >                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.employee?.First_Name || entry.First_Name || "N/A"}{" "}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.leave_type?.LT_name || entry.LT_name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(entry.Fr_Date)} - {formatDate(entry.To_Date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-red-600">
                        {entry.Tot_Days} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        {formatDate(entry.updated_at || entry.created_at)}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        <Link
                          to={`/transactions/attendance-management/leave/leave-cancel-entry/view/${entry.LA_id}`}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {canEditEntry() && (
                          <Link
                            to={`/transactions/attendance-management/leave/leave-cancel-entry/edit/${entry.LA_id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}
                        {canEditEntry() && (
                          <button
                            onClick={() => handleDelete(entry)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
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
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      No cancelled leave found
                    </p>
                    {!searchTerm && (isAdmin || userPermissions.canCreate) && (
                      <Link
                        to="/transactions/attendance-management/leave/leave-cancel-entry/create"
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Cancellation
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            cancelled entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage == 1}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum =
                totalPages <= 5
                  ? i + 1
                  : currentPage <= 3
                  ? i + 1
                  : currentPage >= totalPages - 2
                  ? totalPages - 4 + i
                  : currentPage - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 rounded-lg ${
                    currentPage == pageNum
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
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
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveCancelList;