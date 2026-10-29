// leave-recall-approval/list.jsx
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
  User,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { LeaveApplicationApi } from "../../../../services/leaveapplicationapi";

const LeaveRecallApproval = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("Leave recall Application Approval");
  const [currentStage, setCurrentStage] = useState(null);
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [approvableStatusIds, setApprovableStatusIds] = useState([]);

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
        "/transactions/attendance-management/leave/leave-recall-approval";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem) {
        setPageTitle(currentMenuItem.Fnc_Title || "Leave recall Application Approval");

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
      const response = await LeaveApplicationApi.getAllByStage(stage);

      if (response.status && response.data) {
        const actions = response.data;

        const approvableIds = [];

        actions.forEach((action) => {
          if (action.Previous_Status) {
            let hasAuthority = adminCheck;

            if (!adminCheck && desigId) {
              const isAuthority = action.authorities_details?.some(
                (auth) => parseInt(auth.Dsg_id) == desigId,
              );
              hasAuthority = isAuthority;
            }

            if (hasAuthority) {
              approvableIds.push(parseInt(action.Previous_Status));
            }
          }
        });

        setApprovableStatusIds(approvableIds);
      }

      setPermissionsLoaded(true);
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
      const statusParam =
        approvableStatusIds.length > 0 ? approvableStatusIds.join(",") : "";

      const result = await LeaveApplicationApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        statusParam,
        "R",
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

  const getHalfDayLabel = (value) => {
    switch (value) {
      case "FH":
        return "First Half";
      case "SH":
        return "Second Half";
      case "FD":
        return "Full Day";
      default:
        return "Full Day";
    }
  };

  const getStatusDisplay = (entry) => {
    if (entry?.r_status) {
      return entry.r_status.St_Name || "Pending";
    }
    if (entry?.status_data) {
      return entry.status_data.St_Name || "Pending";
    }
    return "Pending";
  };

  const getStatusBadge = (entry) => {
    const statusName = getStatusDisplay(entry);
    const statusLower = statusName.toLowerCase();

    let colorClass = "bg-yellow-100 text-yellow-800";
    if (statusLower.includes("approv") || statusLower.includes("accept")) {
      colorClass = "bg-green-100 text-green-800";
    } else if (statusLower.includes("reject") || statusLower.includes("deny")) {
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
              Review and approve leave recall applications
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
            placeholder="Search by employee name, leave type, reason..."
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
                  Dates & Half Day
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Days
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
                    key={entry.LA_id}
                    className="hover:bg-gray-50 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-xs font-medium text-gray-600 w-10">
                            From:
                          </span>
                          <span className="text-sm font-medium text-gray-900 ml-1">
                            {formatDate(entry.Fr_Date)}
                          </span>
                          <span
                            className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              entry.FDt_hfDy == "FD"
                                ? "bg-gray-100 text-gray-700"
                                : entry.FDt_hfDy == "FH"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {getHalfDayLabel(entry.FDt_hfDy)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-xs font-medium text-gray-600 w-10">
                            To:
                          </span>
                          <span className="text-sm font-medium text-gray-900 ml-1">
                            {formatDate(entry.To_Date)}
                          </span>
                          <span
                            className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              entry.TDt_hfDy == "FD"
                                ? "bg-gray-100 text-gray-700"
                                : entry.TDt_hfDy == "FH"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {getHalfDayLabel(entry.TDt_hfDy)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.employee?.First_Name}{" "}
                            {entry.employee?.Last_Name || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.leave_type?.LT_name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-blue-600">
                        {entry.Tot_Days} days
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/transactions/attendance-management/leave/leave-recall-approval/view/${entry.LA_id}`}
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

export default LeaveRecallApproval;
