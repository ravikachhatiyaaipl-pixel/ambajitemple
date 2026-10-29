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
  Hash,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ManualAttendanceApi } from "../../../../services/manualattendanceapi";

const ManualAttendanceList = ({ user }) => {
  const [regularizations, setRegularizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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
  const [pageTitle, setPageTitle] = useState("Manual Attendance Entry");

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
        "/transactions/attendance-management/attendance/manual-attendance-entry";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem) {
        setPageTitle(currentMenuItem.Fnc_Title || "Manual Attendance Entry");

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
      const response = await ManualAttendanceApi.getAllByStage(stage);

      if (response.status && response.data) {
        const actions = response.data;
        setActionsList(actions);

        const initialAction = actions.find((action) => !action.Previous_Status);
        if (initialAction) {
          setInitialActionId(initialAction.Act_Id);
          console.log("Initial Action ID set to:", initialAction.Act_Id);
        }

        if (!adminCheck && desigId) {
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

  const canPerformActionOnEntry = (request, actionType) => {
    if (isAdmin) return true;

    if (actionType == "view") {
      return userPermissions.canView;
    }

    if (actionType == "edit" || actionType == "delete") {
      return userPermissions.canCreate;
    }

    return false;
  };

  const getStatusDisplay = (request) => {
    if (request?.r_status) {
      return request.r_status.St_Name || "Pending";
    }
    if (request.status_rel) {
      return request.status_rel.St_Name || "Pending";
    }
    return "Pending";
  };

  const getStatusBadge = (request) => {
    const statusName = getStatusDisplay(request);
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

  useEffect(() => {
    if (permissionsLoaded) {
      loadRegularizations();
    }
  }, [currentPage, searchTerm, permissionsLoaded]);

  const loadRegularizations = async () => {
    setLoading(true);
    try {
      const statusParam = initialActionId ? initialActionId.toString() : "";

      console.log("Loading with statusParam:", statusParam);

      const result = await ManualAttendanceApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        "",
        "",
        "",
        statusParam,
      );

      setRegularizations(result.regularizations || []);
      setTotalPages(result.pagination?.last_page || 1);
      setTotalItems(result.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading manual attendance:", error);
      toast.error("Failed to load manual attendance entries");
      setRegularizations([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, code) => {
    const request = regularizations.find((r) => r.ARG_id == id);
    if (!canPerformActionOnEntry(request, "delete")) {
      toast.error("You don't have permission to delete this record");
      return;
    }

    const result = await Swal.fire({
      title: "Delete Manual Attendance?",
      text: `Are you sure you want to delete request "${code}"? This action cannot be undone.`,
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
      await ManualAttendanceApi.delete(id);
      toast.success("Manual attendance deleted successfully!");
      loadRegularizations();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(error.response?.data?.message || "Failed to delete");
    }
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

  const getReasonBadge = (reason) => {
    const colors = {
      BIOMETRIC_FAILURE: "bg-red-100 text-red-800",
      FORGOT_PUNCH: "bg-yellow-100 text-yellow-800",
      FIELD_DUTY: "bg-blue-100 text-blue-800",
      OFFICIAL_VISIT: "bg-purple-100 text-purple-800",
      TOUR: "bg-green-100 text-green-800",
      SYSTEM_ERROR: "bg-orange-100 text-orange-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    const colorClass = colors[reason] || "bg-gray-100 text-gray-800";
    const displayText = reason?.replace(/_/g, " ") || "Other";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {displayText}
      </span>
    );
  };

  const canCreate = () => {
    if (isAdmin) return true;
    return userPermissions.canCreate;
  };

  const canEditEntry = (request) => {
    return canPerformActionOnEntry(request, "edit");
  };

  const canDeleteEntry = (request) => {
    return canPerformActionOnEntry(request, "delete");
  };

  const canViewEntry = (request) => {
    return canPerformActionOnEntry(request, "view");
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
              Manage employee manual attendance entries
            </p>
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
            onClick={loadRegularizations}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          {canCreate() && (
            <Link
              to="/transactions/attendance-management/attendance/manual-attendance-entry/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Link>
          )}
        </div>
      </div>

      {/* Action Bar - Sirf Search */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
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
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : regularizations.length > 0 ? (
                regularizations.map((reg) => (
                  <tr
                    key={reg.ARG_id}
                    className="hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      if (
                        !e.target.closest(".action-buttons") &&
                        canViewEntry(reg)
                      ) {
                        navigate(
                          `/transactions/attendance-management/attendance/manual-attendance-entry/view/${reg.ARG_id}`,
                        );
                      }
                    }}
                    style={{
                      cursor: canViewEntry(reg) ? "pointer" : "default",
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {reg.employee?.First_Name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(reg.ARG_FDt)} - {formatDate(reg.ARG_TDt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Holidays: {reg.HlDy_Btwn || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {reg.ARG_Days}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getReasonBadge(reg.ARG_Rsn)}
                      {reg.Reason && (
                        <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">
                          {reg.Reason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(reg)}</td>
                    <td className="px-6 py-4 action-buttons">
                      <div className="flex items-center space-x-2">
                        {canViewEntry(reg) && (
                          <Link
                            to={`/transactions/attendance-management/attendance/manual-attendance-entry/view/${reg.ARG_id}`}
                            className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        {canEditEntry(reg) && (
                          <Link
                            to={`/transactions/attendance-management/attendance/manual-attendance-entry/edit/${reg.ARG_id}`}
                            className="text-purple-600 hover:text-purple-900 p-1.5 hover:bg-purple-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}
                        {canDeleteEntry(reg) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(reg.ARG_id, reg.ARG_Code);
                            }}
                            className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded transition-colors"
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
                    <div className="text-gray-500">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium mb-1">
                        No manual attendance requests found
                      </p>
                      <p className="text-sm">
                        Get started by creating your first request
                      </p>
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

export default ManualAttendanceList;
