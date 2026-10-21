import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  ArrowLeft,
  X,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  User,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight,
  Building,
  Receipt,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { GrantEntryApi } from "../../../services/grantentryapi";

const GrantEntryApprovalList = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("Approval");
  const [currentStage, setCurrentStage] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [approvableStatusIds, setApprovableStatusIds] = useState([]);
  const [actionsForStage, setActionsForStage] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      const adminCheck =
        user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
      setIsAdmin(adminCheck);

      const desigId =
        user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
      const parsedDesigId = desigId ? parseInt(desigId) : null;
      setUserDesignationId(parsedDesigId);

      console.log("User Info for HOD Approval:", {
        desigId: parsedDesigId,
        isAdmin: adminCheck,
      });

      await loadMenuAndStage(adminCheck, parsedDesigId);
    };

    initialize();
  }, [user]);

  const loadMenuAndStage = async (adminCheck, desigId) => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/transactions/grant-management/grant-entry-approval";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem) {
        setPageTitle(currentMenuItem.Fnc_Title || "HOD Approval");

        if (currentMenuItem.action && currentMenuItem.action.stage) {
          const stage = currentMenuItem.action.stage;
          setCurrentStage(stage);
          console.log("Current Stage from menu action:", stage);
          await loadActionsForStage(stage, adminCheck, desigId);
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
        setActionsForStage(actions);

        // Find approvable status IDs (actions that have Previous_Status set)
        const approvableIds = [];

        actions.forEach((action) => {
          // Check if user can approve this action based on designation
          if (action.Previous_Status) {
            // Find the previous action
            const previousAction = actions.find(
              (a) => a.Act_Id == parseInt(action.Previous_Status),
            );

            if (previousAction) {
              // Check if user has authority to approve (designation-based only)
              const isAuthority = action.authorities_details?.some(
                (auth) => parseInt(auth.Dsg_id) == desigId,
              );

              // Only add to approvable IDs if user is authority OR admin
              if (isAuthority || adminCheck) {
                approvableIds.push(previousAction.Act_Id);
                console.log(
                  `Action ${previousAction.St_Name} (ID: ${previousAction.Act_Id}) can be approved to ${action.St_Name} by user designation ${desigId}`,
                );
              }
            }
          }
        });

        setApprovableStatusIds(approvableIds);
        console.log("Approvable Status IDs:", approvableIds);

        setPermissionsLoaded(true);
      } else {
        setPermissionsLoaded(true);
      }
    } catch (error) {
      console.error("Error loading actions for stage:", error);
      setPermissionsLoaded(true);
    }
  };

  useEffect(() => {
    if (permissionsLoaded) {
      loadEntries();
    }
  }, [currentPage, searchTerm, permissionsLoaded]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      // Send all approvable status IDs as comma-separated string
      const statusParam =
        approvableStatusIds.length > 0 ? approvableStatusIds.join(",") : "";

      console.log("Loading entries with status filter:", statusParam);

      const result = await GrantEntryApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        statusParam,
      );

      setEntries(result.entries || []);
      setTotalItems(result.pagination?.total || 0);
      setTotalPages(result.pagination?.last_page || 1);
    } catch (error) {
      console.error("Error loading entries:", error);
      toast.error("Failed to load entries");
      setEntries([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadEntries();
    toast.success("Data refreshed successfully!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
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

  const getStatusDisplay = (entry) => {
    if (entry.action) {
      return entry.action.St_Name || "Unknown";
    }
    return "Unknown";
  };

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

  const getGrantTypeDisplay = (entry) => {
    if (entry.grant_type) {
      return entry.grant_type.GT_Name;
    }
    return "N/A";
  };

  const getBranchDisplay = (entry) => {
    if (entry.department) {
      return entry.department.Dpt_Desc || entry.department.Dpt_Name;
    }
    return "N/A";
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
              Review and approve grant receipt entries
            </p>
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-1">
                Desg ID: {userDesignationId} | Stage: {currentStage}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by grant type, branch, amount..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-24 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearFilters}
              className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Grant Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Branch
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
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading entries...</p>
                    </div>
                  </td>
                </tr>
              ) : entries.length > 0 ? (
                entries.map((entry) => (
                  <tr
                    key={entry.GrTrn_Id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(entry.Date)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Receipt className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getGrantTypeDisplay(entry)}
                          </div>
                          {entry.grant_type?.GT_Code && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              Code: {entry.grant_type.GT_Code}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-900 max-w-xs">
                          {getBranchDisplay(entry)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-900">
                          {entry.budget_head?.Gr_Nm || "N/A"}
                        </div>
                      </div>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/transactions/grant-management/grant-entry-approval/view/${entry.GrTrn_Id}`}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View Details & Approve"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No entries found
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "No entries match your search criteria. Try adjusting your search."
                          : "No entries are pending for approval."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage == 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
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

export default GrantEntryApprovalList;
