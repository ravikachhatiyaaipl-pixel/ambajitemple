// overtime-record-entry/list.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ArrowLeft,
  Calendar,
  User,
  Sunrise,
  Sunset,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { OverTimeRecordApi } from "../../../../services/overtimerecordapi";

const OverTimeRecordList = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageTitle, setPageTitle] = useState("Overtime Record Entry");
  const [currentStage, setCurrentStage] = useState(null);
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialActionId, setInitialActionId] = useState(null);
  const [actionsList, setActionsList] = useState([]);
  const [userPermissions, setUserPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canView: false,
  });
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      const adminCheck =
        user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
      setIsAdmin(adminCheck);

      const deptId =
        user?.departmentData?.Dpt_id ||
        user?.apiUserData?.employee?.department?.Dpt_id;
      const parsedDeptId = deptId ? parseInt(deptId) : null;
      setUserDeptId(parsedDeptId);

      const desigId =
        user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
      const parsedDesigId = desigId ? parseInt(desigId) : null;
      setUserDesignationId(parsedDesigId);

      await loadMenuAndStage(adminCheck, parsedDeptId, parsedDesigId);
    };

    initialize();
  }, [user]);

  const loadMenuAndStage = async (adminCheck, deptId, desigId) => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/attendance-management/attendance/overtime-record-entry";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem) {
        setPageTitle(currentMenuItem.Fnc_Title || currentMenuItem.Fnc_Desc);

        if (currentMenuItem.action && currentMenuItem.action.stage) {
          const stage = currentMenuItem.action.stage;
          setCurrentStage(stage);
          await loadActionsForStage(stage, adminCheck, deptId, desigId);
        } else {
          setPermissionsLoaded(true);
        }
      } else {
        setPermissionsLoaded(true);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
      setPermissionsLoaded(true);
    }
  };

  const loadActionsForStage = async (stage, adminCheck, deptId, desigId) => {
    if (!stage) {
      setPermissionsLoaded(true);
      return;
    }

    try {
      const response = await OverTimeRecordApi.getAllByStage(stage);

      if (response.status && response.data) {
        const actions = response.data;
        setActionsList(actions);

        const initialAction = actions.find((action) => !action.Previous_Status);
        if (initialAction) {
          setInitialActionId(initialAction.Act_Id);
        }

        if (!adminCheck && desigId && deptId) {
          calculateUserPermissions(actions, deptId, desigId);
        } else if (adminCheck) {
          setUserPermissions({
            canCreate: true,
            canEdit: true,
            canDelete: true,
            canApprove: true,
            canView: true,
          });
          setPermissionsLoaded(true);
        } else {
          setPermissionsLoaded(true);
        }
      } else {
        setPermissionsLoaded(true);
      }
    } catch (error) {
      console.error("Error loading actions for stage:", error);
      setPermissionsLoaded(true);
    }
  };

  const calculateUserPermissions = (actions, userDeptId, userDesignationId) => {
    const permissions = {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
      canView: false,
    };

    actions.forEach((action) => {
      const actionDeptId = parseInt(action.Dpt_id);
      const deptMatch = actionDeptId == userDeptId;

      if (!deptMatch) return;

      const isAuthority = action.authorities_details?.some(
        (auth) => parseInt(auth.Dsg_id) == userDesignationId,
      );

      const isViewer = action.viewers_details?.some(
        (viewer) => parseInt(viewer.Dsg_id) == userDesignationId,
      );

      if (!action.Previous_Status && isAuthority) {
        permissions.canCreate = true;
        permissions.canEdit = true;
        permissions.canDelete = true;
        permissions.canView = true;
      }

      if (action.Previous_Status && isAuthority) {
        permissions.canApprove = true;
      }

      if (isAuthority || isViewer) {
        permissions.canView = true;
      }
    });

    setUserPermissions(permissions);
    setPermissionsLoaded(true);
  };

  const canPerformActionOnEntry = (entry, actionType) => {
    if (isAdmin) return true;

    const statusAction = entry.status_rel;
    if (!statusAction) return false;

    const deptMatch = parseInt(statusAction.Dpt_id) == userDeptId;
    if (!deptMatch) return false;

    const isAuthority = statusAction.authorities_details?.some(
      (auth) => parseInt(auth.Dsg_id) == userDesignationId,
    );

    const isViewer = statusAction.viewers_details?.some(
      (viewer) => parseInt(viewer.Dsg_id) == userDesignationId,
    );

    if (actionType == "view") {
      return isAuthority || isViewer;
    }

    if (actionType == "edit" || actionType == "delete") {
      const isInitialAction = !statusAction.Previous_Status;
      return isAuthority && isInitialAction;
    }

    return false;
  };

  useEffect(() => {
    if (permissionsLoaded && initialActionId != null) {
      loadEntries();
    }
  }, [currentPage, searchTerm, permissionsLoaded, initialActionId]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const result = await OverTimeRecordApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        initialActionId,
      );

      setEntries(result.entries || []);
      setTotalPages(result.pagination?.last_page || 1);
      setTotalItems(result.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading overtime records:", error);
      toast.error("Failed to load entries");
      setEntries([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (entry) => {
    if (entry?.r_status_rel) {
      return entry?.r_status_rel?.St_Name || "Pending";
    }
    if (entry?.status_rel) {
      return entry.status_rel.St_Name || "Pending";
    }
    return "Pending";
  };

  const getStatusBadge = (entry) => {
    const statusName = getStatusDisplay(entry);
    const statusLower = statusName.toLowerCase();

    let colorClass = "bg-yellow-100 text-yellow-800";
    if (statusLower.includes("approv") || statusLower.includes("accept")) {
      colorClass = "bg-green-100 text-green-800";
    } else if (
      statusLower.includes("reject") ||
      statusLower.includes("deny") ||
      statusLower.includes("query")
    ) {
      colorClass = "bg-red-100 text-red-800";
    } else if (statusLower.includes("pend") || statusLower.includes("wait")) {
      colorClass = "bg-yellow-100 text-yellow-800";
    } else if (statusLower.includes("verif") || statusLower.includes("check")) {
      colorClass = "bg-blue-100 text-blue-800";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        <Clock className="h-3 w-3 mr-1" />
        {statusName}
      </span>
    );
  };

  const handleDeleteEntry = async (entry) => {
    if (!canPerformActionOnEntry(entry, "delete")) {
      toast.error("You don't have permission to delete this entry");
      return;
    }

    const result = await Swal.fire({
      title: "Delete Overtime Record?",
      text: `Are you sure you want to delete this record? This action cannot be undone.`,
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
      await OverTimeRecordApi.delete(entry.OTR_Id);
      await loadEntries();
      toast.success(`Record deleted successfully!`);
      setSelectedEntries(selectedEntries.filter((id) => id != entry.OTR_Id));
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error(error.response?.data?.message || "Failed to delete record");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "—";
    try {
      if (
        typeof timeString == "string" &&
        timeString.match(/^\d{2}:\d{2}:\d{2}$/)
      ) {
        const [hours, minutes] = timeString.split(":");
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
      return timeString;
    } catch {
      return timeString || "—";
    }
  };

  const formatOvertimeHours = (hours) => {
    if (!hours && hours != 0) return "0:00";
    // If hours is already in HH:MM format (string)
    if (typeof hours == "string" && hours.includes(":")) {
      return hours;
    }
    // If hours is decimal, convert to HH:MM
    const decimal = parseFloat(hours);
    const hrs = Math.floor(decimal);
    const mins = Math.round((decimal - hrs) * 60);
    return `${hrs}:${mins.toString().padStart(2, "0")}`;
  };

  const getShiftBadges = (entry) => {
    const badges = [];
    if (entry.Early_Coming == "Y") {
      badges.push(
        <span
          key="early"
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
        >
          <Sunrise className="h-3 w-3 mr-1" />
          Early Coming
        </span>,
      );
    }
    if (entry.Late_Going == "Y") {
      badges.push(
        <span
          key="late"
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800"
        >
          <Sunset className="h-3 w-3 mr-1" />
          Late Going
        </span>,
      );
    }
    return badges.length > 0 ? <div className="flex gap-1">{badges}</div> : "—";
  };

  const getHolidayBadge = (prxHlDy, sfxHlDy) => {
    if (prxHlDy == "1" || prxHlDy == 1 || prxHlDy == true) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          Prev Holiday
        </span>
      );
    }
    if (sfxHlDy == "1" || sfxHlDy == 1 || sfxHlDy == true) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
          Next Holiday
        </span>
      );
    }
    return null;
  };

  const canCreate = () => {
    if (isAdmin) return true;
    return userPermissions.canCreate;
  };

  const canEditEntry = (entry) => {
    return canPerformActionOnEntry(entry, "edit");
  };

  const canDeleteEntry = (entry) => {
    return canPerformActionOnEntry(entry, "delete");
  };

  const canViewEntry = (entry) => {
    if (isAdmin) return true;
    return canPerformActionOnEntry(entry, "view");
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
            <p className="text-gray-600 mt-1">Manage overtime records</p>
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-1">
                Dept ID: {userDeptId} | Desg ID: {userDesignationId} | Stage:{" "}
                {currentStage}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadEntries}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          {canCreate() && (
            <Link
              to="/transactions/attendance-management/attendance/overtime-record-entry/create"
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Overtime Record
            </Link>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {searchTerm && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  OverTime Hours
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Shift Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Holidays
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Reason
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
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : entries.length > 0 ? (
                entries.map((entry) => (
                  <tr
                    key={entry.OTR_Id}
                    className="hover:bg-gray-50 transition-colors group"
                    onClick={(e) => {
                      if (
                        !e.target.closest(".action-buttons") &&
                        canViewEntry(entry)
                      ) {
                        navigate(
                          `/transactions/attendance-management/attendance/overtime-record-entry/view/${entry.OTR_Id}`,
                        );
                      }
                    }}
                    style={{
                      cursor: canViewEntry(entry) ? "pointer" : "default",
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {formatDate(entry.OTR_Date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {entry.employee?.First_Name}{" "}
                          {entry.employee?.Last_Name || ""}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {formatTime(entry.In_Time)} -{" "}
                        {formatTime(entry.Out_Time)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatOvertimeHours(entry.OTR_Hrs)} hrs
                      </div>
                    </td>
                    <td className="px-6 py-4">{getShiftBadges(entry)}</td>
                    <td className="px-6 py-4">
                      {getHolidayBadge(entry.Prx_HlDy, entry.Sfx_HlDy) || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-sm text-gray-600 max-w-xs truncate"
                        title={entry.Reason}
                      >
                        {entry.Reason || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(entry)}</td>
                    <td
                      className="px-6 py-4 action-buttons"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1">
                        {canViewEntry(entry) && (
                          <Link
                            to={`/transactions/attendance-management/attendance/overtime-record-entry/view/${entry.OTR_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        {canEditEntry(entry) && (
                          <Link
                            to={`/transactions/attendance-management/attendance/overtime-record-entry/edit/${entry.OTR_Id}`}
                            className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}
                        {canDeleteEntry(entry) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEntry(entry);
                            }}
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
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        No overtime records found
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by creating your first overtime record"}
                      </p>
                      {!searchTerm && canCreate() && (
                        <Link
                          to="/transactions/attendance-management/attendance/overtime-record-entry/create"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Record
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

      {entries.length > 0 && (
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
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
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

export default OverTimeRecordList;
