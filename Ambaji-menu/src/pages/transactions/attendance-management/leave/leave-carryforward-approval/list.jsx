// leave-carryforward-approval/list.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Eye, ArrowLeft, X, RefreshCw, Clock,
  Calendar, User, FileText, Shield, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { LeaveCarryForwardApi } from "../../../../services/leavecarryforwardapi";

const APPROVAL_PATH = "/transactions/attendance-management/leave/leave-carryforward-approval";

const LeaveCarryForwardApproval = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageTitle, setPageTitle] = useState("Leave Carry Forward Approval");
  const [currentStage, setCurrentStage] = useState(null);
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [approvableStatusIds, setApprovableStatusIds] = useState([]);
  const [lvMode] = useState("L"); // Force to "L" mode for approval

  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
      setIsAdmin(adminCheck);

      const deptId = user?.departmentData?.Dpt_id || 
                     user?.apiUserData?.employee?.department?.Dpt_id;
      setUserDeptId(deptId ? parseInt(deptId) : null);

      const desigId = user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
      setUserDesignationId(desigId ? parseInt(desigId) : null);

      await loadMenuAndStage(adminCheck, deptId ? parseInt(deptId) : null, desigId ? parseInt(desigId) : null);
    };

    initialize();
  }, [user]);

  const loadMenuAndStage = async (adminCheck, deptId, desigId) => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = APPROVAL_PATH;
      const currentMenuItem = menuDetails.find((item) => item.Menu_Links == currentPath);

      if (currentMenuItem) {
        setPageTitle(currentMenuItem.Fnc_Title || "Leave Carry Forward Approval");

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
      const response = await LeaveCarryForwardApi.getAllByStage(stage);

      if (response.status && response.data) {
        const actions = response.data;
        const approvableIds = [];

        actions.forEach((action) => {
          if (action.Previous_Status) {
            let hasAuthority = adminCheck;

            if (!adminCheck && desigId) {
              const isAuthority = action.authorities_details?.some(
                (auth) => parseInt(auth.Dsg_id) == desigId
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
      const statusParam = approvableStatusIds.length > 0 ? approvableStatusIds.join(",") : "";

      const result = await LeaveCarryForwardApi.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        statusParam,  // Filter by status IDs user can approve
        lvMode       // "L" for approval mode
      );

      setEntries(result.entries || []);
      setTotalItems(result.pagination?.total || 0);
      setTotalPages(result.pagination?.last_page || 1);
    } catch (error) {
      console.error("Error loading entries:", error);
      toast.error("Failed to load entries");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusDisplay = (entry) => {
    if (entry?.r_status) return entry.r_status.St_Name || "Pending";
    if (entry?.status_data) return entry.status_data.St_Name || "Pending";
    return "Pending";
  };

  const getStatusBadge = (entry) => {
    const statusName = getStatusDisplay(entry);
    const lower = statusName.toLowerCase();
    
    let cls = "bg-yellow-100 text-yellow-800";
    if (lower.includes("approv") || lower.includes("accept")) cls = "bg-green-100 text-green-800";
    else if (lower.includes("reject") || lower.includes("query")) cls = "bg-red-100 text-red-800";
    else if (lower.includes("verif") || lower.includes("check")) cls = "bg-blue-100 text-blue-800";
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
        <Clock className="h-3 w-3 mr-1" />
        {statusName}
      </span>
    );
  };

  if (!permissionsLoaded) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading permissions...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate("/dashboard")} className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-gray-600 mt-1">Review and approve carry forward requests</p>
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-1">
                Dept ID: {userDeptId} | Desg ID: {userDesignationId} | Stage: {currentStage} | Mode: Approval (L)
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => { loadEntries(); toast.success("Refreshed!"); }}
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
      
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by employee name, leave type..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Transaction Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Days</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Financial Year</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
                  </td>
                </tr>
              ) : entries.length > 0 ? (
                entries.map((entry) => (
                  <tr key={entry.LTr_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <User className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.employee?.First_Name} {entry.employee?.Last_Name || ""}
                          </div>
                          <div className="text-xs text-gray-500">Code: {entry.employee?.Emp_Code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <div className="text-sm font-medium text-gray-900">{entry.leave_type?.LT_name || "N/A"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 mr-2" />
                        {formatDate(entry.Tr_Date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-teal-600">{entry.Tr_Days} days</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{entry.financial_year?.FY_Code || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(entry)}</td>
                    <td className="px-6 py-4">
                      <Link to={`${APPROVAL_PATH}/view/${entry.LTr_id}`} className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg inline-flex" title="View & Approve">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No entries found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? "No entries match your search." : "No carry forward requests are pending for approval."}
                    </p>
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
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage == 1} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              return (
                <button key={p} onClick={() => setCurrentPage(p)} className={`px-4 py-2 rounded-lg ${currentPage == p ? "bg-gradient-to-r from-teal-600 to-cyan-700 text-white" : "bg-white border border-gray-300 hover:bg-gray-50"}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage == totalPages} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveCarryForwardApproval;