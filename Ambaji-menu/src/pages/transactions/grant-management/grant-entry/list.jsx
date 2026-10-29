import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Receipt,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Layers,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { GrantEntryApi } from "../../../services/grantentryapi";

const GrantEntryList = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageTitle, setPageTitle] = useState("Grant Entry");
  const [currentStage, setCurrentStage] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialActionId, setInitialActionId] = useState(null);
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
      // Check if user is admin (Role ID = 1)
      const adminCheck =
        user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
      setIsAdmin(adminCheck);

      // Get user's designation ID from employee profile
      const desigId =
        user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
      const parsedDesigId = desigId ? parseInt(desigId) : null;
      setUserDesignationId(parsedDesigId);

      console.log("User Info:", {
        desigId: parsedDesigId,
        isAdmin: adminCheck,
      });

      // Get menu action configuration from menu_details
      await loadMenuAndStage(adminCheck, parsedDesigId);
    };

    initialize();
  }, [user]);

  // Load menu action and get stage from it
  const loadMenuAndStage = async (adminCheck, desigId) => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/grant-management/grant-entry";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem) {
        setPageTitle(currentMenuItem.Fnc_Title || currentMenuItem.Fnc_Desc);

        // Get stage from the action object
        if (currentMenuItem.action && currentMenuItem.action.stage) {
          const stage = currentMenuItem.action.stage;
          setCurrentStage(stage);
          console.log("Current Stage from menu action:", stage);

          // Load actions for this stage
          await loadActionsForStage(stage, adminCheck, desigId);
        } else {
          console.warn("No stage found in menu action");
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

  // Load all actions for the current stage
  const loadActionsForStage = async (stage, adminCheck, desigId) => {
    if (!stage) {
      setPermissionsLoaded(true);
      return;
    }

    try {
      const response = await GrantEntryApi.getAllByStage(stage);
      console.log(`Actions for stage ${stage}:`, response);

      if (response.status && response.data) {
        const actions = response.data;
        console.log("Total actions loaded:", actions.length);

        // Find and store the initial action ID (Previous_Status = null)
        const initialAction = actions.find((action) => !action.Previous_Status);
        if (initialAction) {
          setInitialActionId(initialAction.Act_Id);
          console.log("Initial Action ID set to:", initialAction.Act_Id);
        }

        // Calculate user permissions based on actions
        if (!adminCheck && desigId) {
          console.log("Calculating permissions for non-admin user...");
          calculateUserPermissions(actions, desigId);
        } else if (adminCheck) {
          console.log("User is admin, setting all permissions to true");
          setUserPermissions({
            canCreate: true,
            canEdit: true,
            canDelete: true,
            canApprove: true,
            canView: true,
          });
          setPermissionsLoaded(true);
        } else {
          console.log("No user designation, setting permissions to false");
          setPermissionsLoaded(true);
        }
      } else {
        console.log("No data in response");
        setPermissionsLoaded(true);
      }
    } catch (error) {
      console.error("Error loading actions for stage:", error);
      setPermissionsLoaded(true);
    }
  };

  // Calculate what actions user can perform based on their designation ONLY
  const calculateUserPermissions = (actions, userDesignationId) => {
    const permissions = {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
      canView: false,
    };

    console.log("==  Calculating permissions ===");
    console.log("User Designation ID:", userDesignationId);
    console.log("Total actions:", actions.length);

    // Check each action to see if user has authority or viewer permissions
    actions.forEach((action) => {
      console.log(
        `\n--- Checking action: ${action.St_Name} (Act_Id: ${action.Act_Id}) ---`,
      );
      console.log(`Previous Status: ${action.Previous_Status}`);

      // Check if user is authority for this action
      const isAuthority = action.authorities_details?.some((auth) => {
        const authDesigId = parseInt(auth.Dsg_id);
        const match = authDesigId == userDesignationId;
        if (match) {
          console.log(
            `  ✅ Authority Dsg: ${authDesigId} (${auth.Dsg_Desc}) -> MATCH!`,
          );
        }
        return match;
      });

      // Check if user is viewer for this action
      const isViewer = action.viewers_details?.some((viewer) => {
        const viewerDesigId = parseInt(viewer.Dsg_id);
        const match = viewerDesigId == userDesignationId;
        if (match) {
          console.log(
            `  ✅ Viewer Dsg: ${viewerDesigId} (${viewer.Dsg_Desc}) -> MATCH!`,
          );
        }
        return match;
      });

      console.log(`Is Authority: ${isAuthority}, Is Viewer: ${isViewer}`);
      console.log(`Is Initial Action: ${!action.Previous_Status}`);

      // For initial action (Previous_Status = null) - allows create, edit, delete
      if (!action.Previous_Status && isAuthority) {
        permissions.canCreate = true;
        permissions.canEdit = true;
        permissions.canDelete = true;
        permissions.canView = true;
        console.log(
          `✅✅✅ User has FULL access for initial action: ${action.St_Name} ✅✅✅`,
        );
      }

      // For actions that can approve
      if (action.Previous_Status && isAuthority) {
        permissions.canApprove = true;
        console.log(`✅ User can APPROVE for action: ${action.St_Name}`);
      }

      // View permission if user is authority or viewer
      if (isAuthority || isViewer) {
        permissions.canView = true;
        console.log(`✅ User can VIEW for action: ${action.St_Name}`);
      }
    });

    console.log("\n==  Final User Permissions ===");
    console.log("canCreate:", permissions.canCreate);
    console.log("canEdit:", permissions.canEdit);
    console.log("canDelete:", permissions.canDelete);
    console.log("canApprove:", permissions.canApprove);
    console.log("canView:", permissions.canView);

    setUserPermissions(permissions);
    setPermissionsLoaded(true);
  };

  // Load entries only after permissions are loaded and initialActionId is set
  useEffect(() => {
    if (permissionsLoaded && initialActionId != null) {
      loadEntries();
    }
  }, [currentPage, searchTerm, permissionsLoaded, initialActionId]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      console.log("Loading entries with status filter:", initialActionId);

      const result = await GrantEntryApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        initialActionId,
      );

      setEntries(result.entries || []);
      setTotalPages(result.pagination?.last_page || 1);
      setTotalItems(result.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading grant entries:", error);
      toast.error("Failed to load entries");
      setEntries([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Check if user can perform action on a specific entry (Department check REMOVED)
  const canPerformActionOnEntry = (entry, actionType) => {
    if (isAdmin) return true;

    const statusAction = entry.action;
    if (!statusAction) return false;

    // Department check removed - only designation check remains
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

    if (actionType == "approve" || actionType == "reject") {
      const hasPreviousStatus = !!statusAction.Previous_Status;
      return isAuthority && hasPreviousStatus;
    }

    return false;
  };

  // Get status display text from action
  const getStatusDisplay = (entry) => {
    if (entry.action) {
      return entry.action.St_Name || "Unknown";
    }
    return "Unknown";
  };

  // Get status badge based on action
  const getStatusBadge = (entry) => {
    const statusName = getStatusDisplay(entry);

    const statusColors = {
      "Grant Receipt": { color: "blue", icon: Clock },
      Verification: { color: "yellow", icon: Clock },
      Approval: { color: "green", icon: CheckCircle },
      Payment: { color: "purple", icon: CheckCircle },
      Rejected: { color: "red", icon: XCircle },
    };

    const config = statusColors[statusName] || { color: "gray", icon: Clock };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
      >
        <Icon className="h-3 w-3 mr-1" />
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
      title: "Delete Grant Entry?",
      text: `Are you sure you want to delete this entry? This action cannot be undone.`,
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
      await GrantEntryApi.delete(entry.GrTrn_Id);
      await loadEntries();
      toast.success(`Entry deleted successfully!`);
      setSelectedEntries(selectedEntries.filter((id) => id != entry.GrTrn_Id));
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error(error.response?.data?.message || "Failed to delete entry");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.length == 0) {
      toast.error("No entries selected");
      return;
    }

    const selectedEntriesData = entries.filter((e) =>
      selectedEntries.includes(e.GrTrn_Id),
    );
    const canDeleteAll = selectedEntriesData.every((entry) =>
      canPerformActionOnEntry(entry, "delete"),
    );

    if (!canDeleteAll) {
      toast.error(
        "Some selected entries cannot be deleted due to permission restrictions",
      );
      return;
    }

    const result = await Swal.fire({
      title: "Bulk Delete?",
      text: `Are you sure you want to delete ${selectedEntries.length} selected entries?`,
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
        const deletePromises = selectedEntries.map((id) =>
          GrantEntryApi.delete(id),
        );
        await Promise.all(deletePromises);

        await loadEntries();
        setSelectedEntries([]);
        toast.success(
          `${selectedEntries.length} entry(s) deleted successfully!`,
        );
      } catch (error) {
        toast.error("Failed to delete some entries");
        await loadEntries();
      } finally {
        setLoading(false);
      }
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
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount != 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const truncateText = (text, length = 60) => {
    if (!text) return "N/A";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  // Check if user can create new entries
  const canCreate = () => {
    if (isAdmin) return true;
    return userPermissions.canCreate;
  };

  // Check if entry can be edited
  const canEditEntry = (entry) => {
    return canPerformActionOnEntry(entry, "edit");
  };

  // Check if entry can be deleted
  const canDeleteEntry = (entry) => {
    return canPerformActionOnEntry(entry, "delete");
  };

  // Check if user can view the entry
  const canViewEntry = (entry) => {
    if (isAdmin) return true;
    return canPerformActionOnEntry(entry, "view");
  };

  // Show loading while permissions are being loaded
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
            <p className="text-gray-600 mt-1">Manage grant receipt entries</p>
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-1">
                Desg ID: {userDesignationId} | Stage: {currentStage}
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
              to="/transactions/grant-management/grant-entry/create"
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Grant Entry
            </Link>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by grant type, branch, amount..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Clear Filters Button */}
          {searchTerm && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Bulk Actions - Only show for admin */}
        {selectedEntries.length > 0 && isAdmin && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {selectedEntries.length}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-800">
                  {selectedEntries.length} entry(s) selected
                </span>
                <p className="text-xs text-blue-600">
                  Choose an action for selected entries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedEntries([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {isAdmin && (
                  <th className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={
                        selectedEntries.length == entries.length &&
                        entries.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEntries(entries.map((e) => e.GrTrn_Id));
                        } else {
                          setSelectedEntries([]);
                        }
                      }}
                    />
                  </th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Financial Year
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Grant Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Budget Head
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
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
                  <td
                    colSpan={isAdmin ? "9" : "8"}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : entries.length > 0 ? (
                entries.map((entry) => (
                  <tr
                    key={entry.GrTrn_Id}
                    className="hover:bg-gray-50 transition-colors group"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons") &&
                        canViewEntry(entry)
                      ) {
                        navigate(
                          `/transactions/grant-management/grant-entry/view/${entry.GrTrn_Id}`,
                        );
                      }
                    }}
                    style={{
                      cursor: canViewEntry(entry) ? "pointer" : "default",
                    }}
                  >
                    {isAdmin && (
                      <td
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedEntries.includes(entry.GrTrn_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEntries([
                                ...selectedEntries,
                                entry.GrTrn_Id,
                              ]);
                            } else {
                              setSelectedEntries(
                                selectedEntries.filter(
                                  (id) => id != entry.GrTrn_Id,
                                ),
                              );
                            }
                          }}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDate(entry.Date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {entry.financial_year ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.financial_year.FY_Name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.financial_year.FY_Code}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {entry.department ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.department.Dpt_Desc}
                          </div>
                          {entry.department.Dpt_Name &&
                            entry.department.Dpt_Name !=
                              entry.department.Dpt_Desc && (
                              <div className="text-xs text-gray-500">
                                {entry.department.Dpt_Name}
                              </div>
                            )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {entry.grant_type ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.grant_type.GT_Name}
                          </div>
                          {entry.grant_type.GT_Code && (
                            <div className="text-xs text-gray-500">
                              Code: {entry.grant_type.GT_Code}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {entry.budget_head ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.budget_head.Gr_Nm}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(entry.Amount)}
                        </span>
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
                            to={`/transactions/grant-management/grant-entry/view/${entry.GrTrn_Id}`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}

                        {canEditEntry(entry) && (
                          <Link
                            to={`/transactions/grant-management/grant-entry/edit/${entry.GrTrn_Id}`}
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
                  <td
                    colSpan={isAdmin ? "9" : "8"}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Receipt className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        No grant entries found
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by creating your first grant entry"}
                      </p>
                      {!searchTerm && canCreate() && (
                        <Link
                          to="/transactions/grant-management/grant-entry/create"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Entry
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

export default GrantEntryList;
