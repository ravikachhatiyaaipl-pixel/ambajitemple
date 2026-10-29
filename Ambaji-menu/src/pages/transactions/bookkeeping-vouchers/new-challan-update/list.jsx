// src/pages/Transactions/BookkeepingVouchers/NewChallanUpdate/List.jsx
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
  Building,
  ArrowLeft,
  Hash,
  Calendar,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { newChallanFlowService } from "../../../services/newchallanflowservice";

const NewChallanUpdateList = ({ user }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [pageTitle, setPageTitle] = useState("Income Challan Voucher Management");
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
    canView: false
  });
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
      setIsAdmin(adminCheck);
      
      const deptId = user?.departmentData?.Dpt_id || 
                     user?.apiUserData?.employee?.department?.Dpt_id;
      const parsedDeptId = deptId ? parseInt(deptId) : null;
      setUserDeptId(parsedDeptId);

      const desigId = user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
      const parsedDesigId = desigId ? parseInt(desigId) : null;
      setUserDesignationId(parsedDesigId);
      
      await loadMenuAndStage(adminCheck, parsedDeptId, parsedDesigId);
    };

    initialize();
  }, [user]);

  const loadMenuAndStage = async (adminCheck, deptId, desigId) => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = "/transactions/bookkeeping-vouchers/new-challan-update";
      const currentMenuItem = menuDetails.find(item => item.Menu_Links == currentPath);
      
      if (currentMenuItem) {
        setPageTitle(currentMenuItem.Fnc_Title || "Income Challan Voucher Management");
        
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
    const response = await newChallanFlowService.getAllByStage(stage);
    
    if (response.status && response.data) {
      const actions = response.data;
      setActionsList(actions);
      
      const initialAction = actions.find(action => !action.Previous_Status);
      if (initialAction) {
        setInitialActionId(initialAction.Act_Id);
      }
      
      // Sirf designation check - department optional
      if (!adminCheck && desigId) {  // Removed && deptId condition
        calculateUserPermissions(actions, deptId, desigId);
      } else if (adminCheck) {
        setUserPermissions({
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canApprove: true,
          canView: true
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
  console.log("== calculateUserPermissions START ==");
  console.log("User Designation ID:", userDesignationId);
  console.log("Total Actions:", actions.length);
  console.log("Actions List:", actions.map(a => ({
    St_Name: a.St_Name,
    Act_Id: a.Act_Id,
    Previous_Status: a.Previous_Status,
    Authorities: a.authorities_details?.map(auth => auth.Dsg_id),
    Viewers: a.viewers_details?.map(viewer => viewer.Dsg_id)
  })));

  const permissions = {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canView: false
  };

  actions.forEach(action => {
    const isAuthority = action.authorities_details?.some(auth => 
      parseInt(auth.Dsg_id) == userDesignationId
    );
    const isViewer = action.viewers_details?.some(viewer => 
      parseInt(viewer.Dsg_id) == userDesignationId
    );

    console.log(`Action: ${action.St_Name}, isAuthority: ${isAuthority}, isViewer: ${isViewer}, isInitial: ${!action.Previous_Status}`);

    if (!action.Previous_Status && isAuthority) {
      permissions.canCreate = true;
      permissions.canEdit = true;
      permissions.canDelete = true;
      permissions.canView = true;
      console.log(`✅ FULL ACCESS for ${action.St_Name}`);
    }

    if (action.Previous_Status && isAuthority) {
      permissions.canApprove = true;
      console.log(`✅ APPROVE ACCESS for ${action.St_Name}`);
    }

    if (isAuthority || isViewer) {
      permissions.canView = true;
      console.log(`✅ VIEW ACCESS for ${action.St_Name}`);
    }
  });

  console.log("== Final Permissions ==", permissions);
  setUserPermissions(permissions);
  setPermissionsLoaded(true);
};

const canPerformActionOnVoucher = (voucher, actionType) => {
  if (isAdmin) return true;
  
  if (actionType == 'view') {
    return userPermissions.canView;
  }
  
  if (actionType == 'edit' || actionType == 'delete') {
    return userPermissions.canCreate;
  }
  
  return false;
};
  // Get dynamic status display from status_master
  const getStatusDisplay = (voucher) => {
    if (voucher?.RStatus) {
      return voucher.RStatus.St_Name || "Pending";
    }
    if (voucher.status_master) {
      return voucher.status_master.St_Name || "Pending";
    }
    return "Pending";
  };

  // Get dynamic status badge with appropriate styling based on status
  const getStatusBadge = (voucher) => {
    const statusName = getStatusDisplay(voucher);
    
    // Find status in actions list to get appropriate color mapping
    const statusAction = actionsList.find(action => action.St_Name == statusName);
    
    // Dynamic color mapping based on status characteristics
    let colorClass = "bg-gray-100 text-gray-800";
    
    if (statusAction) {
      // You can define color logic based on status name or other properties
      const statusLower = statusName.toLowerCase();
      if (statusLower.includes('approv') || statusLower.includes('accept')) {
        colorClass = "bg-green-100 text-green-800";
      } else if (statusLower.includes('reject') || statusLower.includes('deny')) {
        colorClass = "bg-red-100 text-red-800";
      } else if (statusLower.includes('pend') || statusLower.includes('wait')) {
        colorClass = "bg-yellow-100 text-yellow-800";
      } else if (statusLower.includes('verif') || statusLower.includes('check')) {
        colorClass = "bg-blue-100 text-blue-800";
      } else {
        colorClass = "bg-gray-100 text-gray-800";
      }
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        <Clock className="h-3 w-3 mr-1" />
        {statusName}
      </span>
    );
  };

  useEffect(() => {
    if (permissionsLoaded) {
      loadVouchers();
    }
  }, [currentPage, searchTerm, filterBranch, filterStatus, startDate, endDate, permissionsLoaded]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      let statusParam = "";
      if (filterStatus) {
        statusParam = filterStatus;
      }
          const dptId = !isAdmin && !filterBranch ? userDeptId : filterBranch;

      const result = await newChallanFlowService.getAllVoucher(
        currentPage,
        itemsPerPage,
        searchTerm,
        dptId, 
        // filterBranch,
        startDate,
        endDate,
        "Y",
        // statusParam
      );

      setVouchers(result.vouchers || []);
      setTotalPages(result.pagination?.last_page || 1);
      setTotalItems(result.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading challan vouchers:", error);
      toast.error("Failed to load challan vouchers");
      setVouchers([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVoucher = async (voucherId, voucherNo) => {
    const voucher = vouchers.find(v => v.CV_Id == voucherId);
    if (!canPerformActionOnVoucher(voucher, 'delete')) {
      toast.error("You don't have permission to delete this voucher");
      return;
    }

    const result = await Swal.fire({
      title: "Delete Challan Voucher?",
      text: `Are you sure you want to delete voucher "${voucherNo}"? This action cannot be undone.`,
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
      await newChallanFlowService.delete(voucherId);
      await loadVouchers();
      toast.success(`Voucher "${voucherNo}" deleted successfully!`);
      setSelectedVouchers(selectedVouchers.filter((id) => id != voucherId));
    } catch (error) {
      console.error("Error deleting challan voucher:", error);
      toast.error(error.response?.data?.message || "Failed to delete challan voucher");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterBranch("");
    setFilterStatus("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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

  const getBranchDisplay = (voucher) => {
    if (!voucher.department) return "N/A";
    
    const dept = voucher.department;
    let displayText = dept.Dpt_Desc || "";
    
    if (dept.Dpt_Name && dept.Dpt_Name != dept.Dpt_Desc) {
      displayText += ` (${dept.Dpt_Name})`;
    }
    
    return displayText;
  };

  const getTotalAmount = (voucher) => {
    if (!voucher.Net_Amount) return 0;
    return parseFloat(voucher.Net_Amount) || 0;
  };

  const getItemCount = (voucher) => {
    return voucher.details?.length || 0;
  };

  const canCreate = () => {
    if (isAdmin) return true;
    return userPermissions.canCreate;
  };

  const canEditVoucher = (voucher) => {
    return canPerformActionOnVoucher(voucher, 'edit');
  };

  const canDeleteVoucher = (voucher) => {
    return canPerformActionOnVoucher(voucher, 'delete');
  };

  const canViewVoucher = (voucher) => {
    return canPerformActionOnVoucher(voucher, 'view');
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
              Manage and track income challan vouchers
            </p>
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-1">
                Dept ID: {userDeptId} | Desg ID: {userDesignationId} | Stage: {currentStage}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadVouchers}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium flex items-center transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          {canCreate() && (
            <Link
              to="/transactions/bookkeeping-vouchers/new-challan-update/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Challan Voucher
            </Link>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by voucher number, branch..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Status Filter - Dynamic from actionsList */}
      


          {(searchTerm || filterBranch || filterStatus || startDate || endDate) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isAdmin && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={
                        selectedVouchers.length == vouchers.length &&
                        vouchers.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVouchers(vouchers.map((v) => v.CV_Id));
                        } else {
                          setSelectedVouchers([]);
                        }
                      }}
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voucher Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Challan Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
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
                  <td colSpan={isAdmin ? "9" : "8"} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : vouchers.length > 0 ? (
                vouchers.map((voucher) => (
                  <tr
                    key={voucher.CV_Id}
                    className="hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      if (
                        !e.target.closest('input[type="checkbox"]') &&
                        !e.target.closest(".action-buttons") &&
                        canViewVoucher(voucher)
                      ) {
                        navigate(
                          `/transactions/bookkeeping-vouchers/new-challan-update/view/${voucher.CV_Id}`,
                        );
                      }
                    }}
                    style={{ cursor: canViewVoucher(voucher) ? "pointer" : "default" }}
                  >
                    {isAdmin && (
                      <td
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedVouchers.includes(voucher.CV_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVouchers([
                                ...selectedVouchers,
                                voucher.CV_Id,
                              ]);
                            } else {
                              setSelectedVouchers(
                                selectedVouchers.filter(
                                  (id) => id != voucher.CV_Id,
                                ),
                              );
                            }
                          }}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-sm font-semibold text-gray-900">
                            {voucher.CV_No}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Date: {formatDate(voucher.Ch_Date)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <Building className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-900">
                          {getBranchDisplay(voucher)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {voucher.challan_type?.Cht_Name || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                        <div className="text-xs text-green-600">Total Amount</div>
                        <div className="text-lg font-bold text-green-700">
                          {formatCurrency(getTotalAmount(voucher))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getItemCount(voucher)} items
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(voucher)}
                    </td>
                    <td className="px-6 py-4 action-buttons">
                      <div className="flex items-center space-x-2">
                        {canViewVoucher(voucher) && (
                          <Link
                            to={`/transactions/bookkeeping-vouchers/new-challan-update/view/${voucher.CV_Id}`}
                            className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}

                        {canEditVoucher(voucher) && (
                          <Link
                            to={`/transactions/bookkeeping-vouchers/new-challan-update/edit/${voucher.CV_Id}`}
                            className="text-purple-600 hover:text-purple-900 p-1.5 hover:bg-purple-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}

                        {canDeleteVoucher(voucher) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVoucher(voucher.CV_Id, voucher.CV_No);
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
                  <td colSpan={isAdmin ? "9" : "8"} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium mb-1">
                        No challan vouchers found
                      </p>
                      <p className="text-sm mb-4">
                        {searchTerm || filterBranch || filterStatus || startDate || endDate
                          ? "Try adjusting your search or filters"
                          : "Get started by creating your first challan voucher"}
                      </p>
                      {!searchTerm && !filterBranch && !filterStatus && !startDate && !endDate && canCreate() && (
                        <Link
                          to="/transactions/bookkeeping-vouchers/new-challan-update/create"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Voucher
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

export default NewChallanUpdateList;