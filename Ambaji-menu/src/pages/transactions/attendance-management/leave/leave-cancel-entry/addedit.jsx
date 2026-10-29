// leave-cancel-entry/addedit.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save, X, ArrowLeft, FileText, Calendar, Layers, AlertCircle,
  ChevronDown, Search, Check, User, XCircle, Loader, Trash2, RefreshCw
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LeaveApplicationApi } from "../../../../services/leaveapplicationapi";
import axios from "axios";

// Searchable Dropdown Component (same as leave recall)
const SearchableDropdown = ({
  label,
  value,
  error,
  required = false,
  icon: Icon,
  isOpen,
  setIsOpen,
  searchTerm,
  setSearchTerm,
  items,
  filteredItems,
  onSelect,
  getSelectedDisplay,
  loading,
  placeholder,
  searchPlaceholder,
  buttonRef,
  dropdownRef,
  searchRef,
  getId = (item) => item?.id,
  disabled = false,
  renderItem,
}) => {
  return (
    <div
      ref={dropdownRef}
      className="relative"
      style={{ zIndex: isOpen ? 9999 : 1 }}
    >
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        )}

        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 border ${
            error ? "border-red-300" : "border-gray-300"
          } rounded-lg focus:border-transparent text-left ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          } transition-colors`}
        >
          {value ? (
            <span className="text-gray-900">{getSelectedDisplay()}</span>
          ) : (
            <span className="text-gray-500">
              {loading ? `Loading ${label.toLowerCase()}...` : placeholder}
            </span>
          )}
        </button>

        {loading ? (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          !disabled && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )
        )}

        {error && (
          <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
            style={{
              minWidth: "300px",
              maxWidth: "calc(100vw - 40px)",
              position: "absolute",
              top: "100%",
              left: 0,
              zIndex: 9999,
              backgroundColor: "white",
            }}
          >
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-64">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const itemId = getId(item);
                  const isSelected = value && itemId == value;

                  return (
                    <button
                      key={itemId}
                      type="button"
                      onClick={() => {
                        onSelect(item);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-red-50 ${
                        isSelected ? "bg-red-50" : "text-gray-700"
                      }`}
                    >
                      {renderItem ? (
                        renderItem(item)
                      ) : (
                        <div className="font-medium">
                          {item.name || `Item ${itemId}`}
                        </div>
                      )}
                      {isSelected && (
                        <div className="text-xs text-red-600 mt-1 flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Selected
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p>No items found</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

const AddEditLeaveCancels = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingLeaveApps, setLoadingLeaveApps] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Action Master States
  const [currentStage, setCurrentStage] = useState(null);
  const [cancellationActionId, setCancellationActionId] = useState(null);
  const [cancellationAction, setCancellationAction] = useState(null);
  const [availableActions, setAvailableActions] = useState([]);
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCancelPermission, setHasCancelPermission] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    Fy_Id: "",
    LT_id: "",
    Emp_Id: "",
  });
  
  // Filter dropdown data
  const [fyData, setFyData] = useState([]);
  const [leaveTypeData, setLeaveTypeData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  
  // Filtered data for dropdowns
  const [filteredFy, setFilteredFy] = useState([]);
  const [filteredLeaveTypes, setFilteredLeaveTypes] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  // Leave applications
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [filteredLeaveApps, setFilteredLeaveApps] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  
  // Selection
  const [selectedLeaveIds, setSelectedLeaveIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Form data
  const [formData] = useState({
    Tr_Type: "CANCEL",
    Tr_Date: new Date().toISOString().split("T")[0],
    Tr_Mode: "C",
  });
  
  // Dropdown UI states
  const [isFyDropdownOpen, setIsFyDropdownOpen] = useState(false);
  const [fySearchTerm, setFySearchTerm] = useState("");
  const fyDropdownRef = useRef(null);
  const fySearchRef = useRef(null);
  const fyButtonRef = useRef(null);

  const [isLeaveTypeDropdownOpen, setIsLeaveTypeDropdownOpen] = useState(false);
  const [leaveTypeSearchTerm, setLeaveTypeSearchTerm] = useState("");
  const leaveTypeDropdownRef = useRef(null);
  const leaveTypeSearchRef = useRef(null);
  const leaveTypeButtonRef = useRef(null);

  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const employeeDropdownRef = useRef(null);
  const employeeSearchRef = useRef(null);
  const employeeButtonRef = useRef(null);

  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // ============================================================
  // STEP 1: Load Menu and Get Stage
  // ============================================================
  const loadMenuAndStage = async () => {
    try {
      const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
      const currentPath = "/transactions/attendance-management/leave/leave-cancel-entry";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath
      );

      if (currentMenuItem && currentMenuItem.action && currentMenuItem.action.stage) {
        const stage = currentMenuItem.action.stage;
        console.log("Stage from menu for CANCEL:", stage);
        setCurrentStage(stage);
        await loadActionsForStage(stage);
      } else {
        console.error("No stage found in menu item action");
        toast.error("Stage not configured for this menu");
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
      toast.error("Failed to load menu configuration");
    }
  };

  // ============================================================
  // STEP 2: Call Action Master API and Find Previous_Status == null
  // ============================================================
  const loadActionsForStage = async (stage) => {
    if (!stage) return;

    try {
      console.log(`Calling Action Master API for stage: ${stage}`);
      const response = await LeaveApplicationApi.getAllByStage(stage);
      console.log("Action Master Response for CANCEL:", response);

      if (response.status && response.data && Array.isArray(response.data)) {
        const actions = response.data;
        setAvailableActions(actions);
        
        // ====================================================
        // CRITICAL: Find action where Previous_Status == null
        // ====================================================
        const initialAction = actions.find(
          (action) => !action.Previous_Status || action.Previous_Status == null
        );
        
        if (initialAction) {
          console.log("Found action with Previous_Status == null for CANCEL:", {
            Act_Id: initialAction.Act_Id,
            St_Name: initialAction.St_Name,
            Previous_Status: initialAction.Previous_Status
          });
          
          // ====================================================
          // STEP 3: Save this Action ID - This will be the STATUS
          // ====================================================
          setCancellationActionId(initialAction.Act_Id);
          setCancellationAction(initialAction);
        } else {
          console.error("No action found with Previous_Status == null for CANCEL");
          toast.error("No cancellation workflow configured. Please check Action Master setup.");
        }

        // Check user permission for cancellation
        if (!isAdmin && userDesignationId && userDeptId) {
          const hasPermission = actions.some((action) => {
            const deptMatch = parseInt(action.Dpt_id) == userDeptId;
            const isAuthority = action.authorities_details?.some(
              (auth) => parseInt(auth.Dsg_id) == userDesignationId
            );
            return deptMatch && isAuthority && !action.Previous_Status;
          });

          setHasCancelPermission(hasPermission);
          console.log("User has cancel permission:", hasPermission);

          if (!hasPermission) {
            toast.error("You don't have permission to cancel leave applications");
          }
        } else if (isAdmin) {
          setHasCancelPermission(true);
          console.log("Admin user - cancel permission granted");
        }
      } else {
        console.error("Invalid response format from action master API:", response);
        toast.error("Failed to load workflow configuration");
      }
    } catch (error) {
      console.error("Error loading actions for stage:", error);
      toast.error("Failed to load workflow configuration");
    }
  };

  // ============================================================
  // Create Cancellation Transaction Record with Status
  // ============================================================
  const createCancellationTransaction = async (leaveId) => {
    const transactionPayload = {
      LA_id: leaveId,
      Tr_Type: "CANCEL",
      Tr_Mode: "C",
      Tr_Date: formData.Tr_Date,
      Status: cancellationActionId,
      Remarks: `Leave cancelled on ${new Date().toLocaleDateString()}`,
      created_by: user?.apiUserData?.Usr_Id || user?.id,
      created_at: new Date().toISOString()
    };
    
    console.log(`Creating cancellation transaction for leave ${leaveId} with Status: ${cancellationActionId}`);
    const response = await axios.post(`${API_BASE_URL}/leave-trans`, transactionPayload,
      {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
    );
    return response.data;
  };

  // ============================================================
  // Initialize Component
  // ============================================================
  useEffect(() => {
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);

    const deptId = user?.departmentData?.Dpt_id || 
                   user?.apiUserData?.employee?.department?.Dpt_id;
    setUserDeptId(deptId ? parseInt(deptId) : null);

    const desigId = user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    setUserDesignationId(desigId ? parseInt(desigId) : null);

    console.log("User info for CANCEL:", { isAdmin: adminCheck, userDeptId: deptId, userDesignationId: desigId });

    loadDropdownData();
    loadMenuAndStage();

    const handleClickOutside = (event) => {
      if (fyDropdownRef.current && !fyDropdownRef.current.contains(event.target))
        setIsFyDropdownOpen(false);
      if (leaveTypeDropdownRef.current && !leaveTypeDropdownRef.current.contains(event.target))
        setIsLeaveTypeDropdownOpen(false);
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target))
        setIsEmployeeDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user]);

  // ============================================================
  // Load Dropdown Data (Financial Year, Leave Type, Employee)
  // ============================================================
  const loadDropdownData = async () => {
    setLoading(true);
    try {
      const fyResponse = await axios.get(`${API_BASE_URL}/fy-master`,{
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        });
      const leaveTypeResponse = await axios.get(`${API_BASE_URL}/leave-type/all`,{
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        });
      const employeeResponse = await axios.get(`${API_BASE_URL}/emp-mast/all`,{
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        });

      if (fyResponse.data && fyResponse.data.success) {
        setFyData(fyResponse.data.data);
        setFilteredFy(fyResponse.data.data);
        const currentYear = fyResponse.data.data.find(
          (fy) => fy.is_current_year == true
        );
        if (currentYear && !filters.Fy_Id) {
          setFilters((prev) => ({
            ...prev,
            Fy_Id: currentYear.FY_Id.toString(),
          }));
        }
      }

      if (leaveTypeResponse.data && leaveTypeResponse.data.success) {
        const leaveTypes = leaveTypeResponse.data.data.filter(type => type.Is_Active !=  false);
        setLeaveTypeData(leaveTypes);
        setFilteredLeaveTypes(leaveTypes);
      }

      if (employeeResponse.data && employeeResponse.data.status) {
        setEmployeeData(employeeResponse.data.data);
        setFilteredEmployees(employeeResponse.data.data);
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoading(false);
    }
  };

  // Filter handlers for dropdowns
  useEffect(() => {
    if (!fySearchTerm.trim()) {
      setFilteredFy(fyData);
    } else {
      const term = fySearchTerm.toLowerCase();
      setFilteredFy(
        fyData.filter(
          (item) =>
            item.FY_Code?.toLowerCase().includes(term) ||
            item.FY_Name?.toLowerCase().includes(term)
        )
      );
    }
  }, [fySearchTerm, fyData]);

  useEffect(() => {
    if (!leaveTypeSearchTerm.trim()) {
      setFilteredLeaveTypes(leaveTypeData);
    } else {
      const term = leaveTypeSearchTerm.toLowerCase();
      setFilteredLeaveTypes(
        leaveTypeData.filter(
          (item) =>
            item.LT_name?.toLowerCase().includes(term) ||
            item.LT_code?.toLowerCase().includes(term)
        )
      );
    }
  }, [leaveTypeSearchTerm, leaveTypeData]);

  useEffect(() => {
    if (!employeeSearchTerm.trim()) {
      setFilteredEmployees(employeeData);
    } else {
      const term = employeeSearchTerm.toLowerCase();
      setFilteredEmployees(
        employeeData.filter(
          (item) =>
            item.First_Name?.toLowerCase().includes(term) ||
            item.Last_Name?.toLowerCase().includes(term) ||
            item.Emp_Code?.toLowerCase().includes(term)
        )
      );
    }
  }, [employeeSearchTerm, employeeData]);

  // Filter pending leave applications by search keyword
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setFilteredLeaveApps(leaveApplications);
    } else {
      const term = searchKeyword.toLowerCase();
      setFilteredLeaveApps(
        leaveApplications.filter(
          (app) =>
            app.LA_Code?.toLowerCase().includes(term) ||
            app.employee?.First_Name?.toLowerCase().includes(term) ||
            app.employee?.Last_Name?.toLowerCase().includes(term) ||
            app.employee?.Emp_Code?.toLowerCase().includes(term) ||
            app.leave_type?.LT_name?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchKeyword, leaveApplications]);

  // ============================================================
  // Fetch Leave Applications for Cancellation
  // ============================================================
  const fetchLeaveApplications = async () => {
    if (!hasCancelPermission && !isAdmin) {
      toast.error("You don't have permission to cancel leave applications");
      return;
    }

    if (!cancellationActionId) {
      toast.error("Workflow configuration not loaded. Please refresh the page.");
      return;
    }

    setLoadingLeaveApps(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("Lv_Mode", "L");
      
      if (filters.Fy_Id) queryParams.append("fy_id", filters.Fy_Id);
      if (filters.LT_id) queryParams.append("lt_id", filters.LT_id);
      if (filters.Emp_Id) queryParams.append("emp_id", filters.Emp_Id);
      
      const apiUrl = `${API_BASE_URL}/leave-application/all?${queryParams.toString()}`;
      console.log("Fetching pending leave applications for cancellation:", apiUrl);
      
      const response = await axios.get(apiUrl,{
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        });

      if (response.data && response.data.success) {
        let applications = [];
        
        if (response.data.data && Array.isArray(response.data.data)) {
          applications = response.data.data;
        } else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          applications = response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
          applications = response.data.data;
        }
        
        // Filter only active leaves (not cancelled, mode L)
        const activeLeaves = applications.filter(app => app.Lv_Mode == "L");
        
        setLeaveApplications(activeLeaves);
        setFilteredLeaveApps(activeLeaves);
        setSelectedLeaveIds([]);
        setSelectAll(false);
        
        if (activeLeaves.length == 0 && applications.length > 0) {
          toast.success("No pending leaves found for cancellation");
        } else if (activeLeaves.length > 0) {
          toast.success(`${activeLeaves.length} pending leave(s) found`);
        } else if (applications.length == 0) {
          toast.info("No leave applications found with the selected filters");
        }
      } else {
        setLeaveApplications([]);
        setFilteredLeaveApps([]);
        toast.error(response.data?.message || "No data found");
      }
    } catch (error) {
      console.error("Error fetching pending leave applications:", error);
      toast.error(error.response?.data?.message || "Failed to fetch pending leave applications");
      setLeaveApplications([]);
      setFilteredLeaveApps([]);
    } finally {
      setLoadingLeaveApps(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setSelectedLeaveIds([]);
    setSelectAll(false);
  };

  const clearFilters = () => {
    setFilters({
      Fy_Id: "",
      LT_id: "",
      Emp_Id: "",
    });
    setSearchKeyword("");
    setFySearchTerm("");
    setLeaveTypeSearchTerm("");
    setEmployeeSearchTerm("");
    setLeaveApplications([]);
    setFilteredLeaveApps([]);
    setSelectedLeaveIds([]);
    setSelectAll(false);
    
    const currentYear = fyData.find((fy) => fy.is_current_year == true);
    if (currentYear) {
      setFilters((prev) => ({ ...prev, Fy_Id: currentYear.FY_Id.toString() }));
    }
    
    toast.success("All filters cleared");
  };

  const handleGenerate = () => {
    if (!hasCancelPermission && !isAdmin) {
      toast.error("You don't have permission to cancel leave applications");
      return;
    }

    if (!cancellationActionId) {
      toast.error("Workflow configuration not loaded. Please refresh the page.");
      return;
    }

    if (!filters.Fy_Id && !filters.LT_id && !filters.Emp_Id) {
      toast.warning("Please select at least one filter (Financial Year, Leave Type, or Employee)");
      return;
    }
    fetchLeaveApplications();
  };

  const handleFySelect = (item) => {
    handleFilterChange("Fy_Id", item.FY_Id.toString());
    setIsFyDropdownOpen(false);
    setFySearchTerm("");
  };

  const handleLeaveTypeSelect = (item) => {
    handleFilterChange("LT_id", item.LT_id.toString());
    setIsLeaveTypeDropdownOpen(false);
    setLeaveTypeSearchTerm("");
  };

  const handleEmployeeSelect = (item) => {
    handleFilterChange("Emp_Id", item.Emp_Id.toString());
    setIsEmployeeDropdownOpen(false);
    setEmployeeSearchTerm("");
  };

  const handleSelectLeave = (laId) => {
    setSelectedLeaveIds((prev) => {
      if (prev.includes(laId)) {
        return prev.filter((id) => id !=  laId);
      } else {
        return [...prev, laId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeaveIds([]);
    } else {
      const allIds = filteredLeaveApps.map((app) => app.LA_id);
      setSelectedLeaveIds(allIds);
    }
    setSelectAll(!selectAll);
  };

  const getSelectedFyName = () => {
    if (!filters.Fy_Id) return "";
    const selected = fyData.find(
      (item) => item.FY_Id == parseInt(filters.Fy_Id)
    );
    return selected ? `${selected.FY_Code} - ${selected.FY_Name}` : "";
  };

  const getSelectedLeaveTypeName = () => {
    if (!filters.LT_id) return "";
    const selected = leaveTypeData.find(
      (item) => item.LT_id == parseInt(filters.LT_id)
    );
    return selected ? selected.LT_name : "";
  };

  const getSelectedEmployeeName = () => {
    if (!filters.Emp_Id) return "";
    const selected = employeeData.find(
      (item) => item.Emp_Id == parseInt(filters.Emp_Id)
    );
    return selected ? `${selected.First_Name} ${selected.Last_Name || ""}` : "";
  };

  const renderFyItem = (item) => (
    <div>
      <div className="font-medium text-gray-900">{item.FY_Code}</div>
      <div className="text-xs text-gray-500">{item.FY_Name}</div>
      {item.is_current_year && (
        <div className="text-xs text-green-600 mt-1">Current Year</div>
      )}
    </div>
  );

  const renderLeaveTypeItem = (item) => (
    <div>
      <div className="font-medium text-gray-900">{item.LT_name}</div>
      <div className="text-xs text-gray-500">
        Max: {item.Max_days} days
      </div>
    </div>
  );

  const renderEmployeeItem = (item) => (
    <div>
      <div className="font-medium text-gray-900">
        {item.First_Name || item.Last_Name || ""} 
      </div>
    </div>
  );

  // ============================================================
  // Handle Cancel Submission
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasCancelPermission && !isAdmin) {
      toast.error("You don't have permission to cancel leave applications");
      return;
    }

    if (selectedLeaveIds.length == 0) {
      toast.error("Please select at least one pending leave application to cancel");
      return;
    }

    if (!cancellationActionId) {
      toast.error("Workflow configuration not loaded. Please refresh the page.");
      return;
    }

    const selectedLeaves = filteredLeaveApps.filter((app) =>
      selectedLeaveIds.includes(app.LA_id)
    );

    const result = await Swal.fire({
      title: `Cancel ${selectedLeaveIds.length} Leave Application?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, cancel leaves!",
      cancelButtonText: "No, keep them",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    
    const cancelResults = {
      success: [],
      failed: []
    };

    try {
      // Step 1: Create cancellation transaction records for each selected leave
      for (const leaveId of selectedLeaveIds) {
        try {
          await createCancellationTransaction(leaveId);
          cancelResults.success.push(leaveId);
          console.log(`✓ Created cancellation transaction for leave ${leaveId} with Status: ${cancellationActionId}`);
        } catch (transactionError) {
          console.error(`✗ Failed to create transaction for leave ${leaveId}:`, transactionError);
          cancelResults.failed.push({ id: leaveId, error: transactionError.message });
        }
      }

      // Step 2: Update leave applications mode to 'C' (Cancelled) with Status
      const bulkPayload = {
        updates: selectedLeaveIds.map((laId) => ({
          id: laId,
          Lv_Mode: "C",
          Status: cancellationActionId
        })),
        cancel_info: {
          action_id: cancellationActionId,
          action_name: cancellationAction?.St_Name || 'Cancelled',
          stage: currentStage,
          Tr_Type: "CANCEL",
          Tr_Mode: "C",
          Tr_Date: formData.Tr_Date,
          cancelled_by: user?.apiUserData?.Usr_Id || user?.id,
          cancelled_by_name: user?.apiUserData?.Usr_Name || user?.name || "System"
        }
      };

      const cancelResponse = await axios.post(`${API_BASE_URL}/leave-application/bulk-update`, bulkPayload, {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
      });

      if (cancelResponse.data && cancelResponse.data.success) {
        const { success_count, failed_count, results } = cancelResponse.data;
        
        const totalSuccess = cancelResults.success.length;
        const totalFailed = cancelResults.failed.length + (failed_count || 0);
        
        if (totalFailed == 0) {
          toast.success(
            `${totalSuccess} pending leave application`,
            { duration: 5000 }
          );
        } else {
          toast.warning(
            `Partially completed: ${totalSuccess} succeeded, ${totalFailed} failed`
          );
          
          const allFailed = [...cancelResults.failed, ...(results?.filter(r => !r.success) || [])];
          if (allFailed.length > 0) {
            console.error("Failed cancellations:", allFailed);
          }
        }

        await fetchLeaveApplications();
        setSelectedLeaveIds([]);
        setSelectAll(false);

        if (totalFailed == 0) {
          setTimeout(() => {
            navigate("/transactions/attendance-management/leave/leave-cancel-entry");
          }, 2000);
        }
      } else {
        throw new Error(cancelResponse.data?.message || "Cancellation failed");
      }
    } catch (error) {
      console.error("Error cancelling leaves:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to cancel leave applications"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/attendance-management/leave/leave-cancel-entry");
  };

  return (
    <div className="p-6 mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/transactions/attendance-management/leave/leave-cancel-entry"
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Leave Cancellation Entry
            </h1>
            <p className="text-gray-600 mt-1">
              Cancel pending leave applications
            </p>
            
            {/* Action Master Status Display */}
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-1">
                Dept ID: {userDeptId} | Desg ID: {userDesignationId} | Stage: {currentStage}
                {!hasCancelPermission ? (
                  <span className="ml-2 text-red-500">(No Cancel Permission)</span>
                ) : (
                  <span className="ml-2 text-green-500">(Cancel Permission Granted)</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mr-3">
                <X className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Leave Cancellation
              </h2>
            </div>
          </div>

          <div className="p-6">
            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <SearchableDropdown
                  label="Financial Year"
                  value={filters.Fy_Id}
                  icon={Calendar}
                  isOpen={isFyDropdownOpen}
                  setIsOpen={setIsFyDropdownOpen}
                  searchTerm={fySearchTerm}
                  setSearchTerm={setFySearchTerm}
                  items={fyData}
                  filteredItems={filteredFy}
                  onSelect={handleFySelect}
                  getSelectedDisplay={getSelectedFyName}
                  loading={loading}
                  placeholder="Select financial year"
                  searchPlaceholder="Search financial year..."
                  buttonRef={fyButtonRef}
                  dropdownRef={fyDropdownRef}
                  searchRef={fySearchRef}
                  getId={(item) => item.FY_Id?.toString()}
                  renderItem={renderFyItem}
                />
              </div>

              <div>
                <SearchableDropdown
                  label="Leave Type"
                  value={filters.LT_id}
                  icon={Layers}
                  isOpen={isLeaveTypeDropdownOpen}
                  setIsOpen={setIsLeaveTypeDropdownOpen}
                  searchTerm={leaveTypeSearchTerm}
                  setSearchTerm={setLeaveTypeSearchTerm}
                  items={leaveTypeData}
                  filteredItems={filteredLeaveTypes}
                  onSelect={handleLeaveTypeSelect}
                  getSelectedDisplay={getSelectedLeaveTypeName}
                  loading={loading}
                  placeholder="Select leave type"
                  searchPlaceholder="Search leave type..."
                  buttonRef={leaveTypeButtonRef}
                  dropdownRef={leaveTypeDropdownRef}
                  searchRef={leaveTypeSearchRef}
                  getId={(item) => item.LT_id?.toString()}
                  renderItem={renderLeaveTypeItem}
                />
              </div>

              <div>
                <SearchableDropdown
                  label="Employee"
                  value={filters.Emp_Id}
                  icon={User}
                  isOpen={isEmployeeDropdownOpen}
                  setIsOpen={setIsEmployeeDropdownOpen}
                  searchTerm={employeeSearchTerm}
                  setSearchTerm={setEmployeeSearchTerm}
                  items={employeeData}
                  filteredItems={filteredEmployees}
                  onSelect={handleEmployeeSelect}
                  getSelectedDisplay={getSelectedEmployeeName}
                  loading={loading}
                  placeholder="Select employee"
                  searchPlaceholder="Search by name or code..."
                  buttonRef={employeeButtonRef}
                  dropdownRef={employeeDropdownRef}
                  searchRef={employeeSearchRef}
                  getId={(item) => item.Emp_Id?.toString()}
                  renderItem={renderEmployeeItem}
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end gap-3 items-center mb-6">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loadingLeaveApps || (!hasCancelPermission && !isAdmin) || !cancellationActionId}
                className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all shadow-sm ${
                  ((!hasCancelPermission && !isAdmin) || !cancellationActionId) ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={(!cancellationActionId ? "Workflow not configured" : (!hasCancelPermission && !isAdmin) ? "You don't have permission to cancel leaves" : "Generate pending leave applications")}
              >
                {loadingLeaveApps ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center text-sm transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Filters
              </button>
            </div>

            {/* Hidden fields */}
            <input type="hidden" name="Tr_Type" value={formData.Tr_Type} />
            <input type="hidden" name="Tr_Mode" value={formData.Tr_Mode} />
            <input type="hidden" name="Tr_Date" value={formData.Tr_Date} />

            {/* Pending Leave Applications Table */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-red-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-700">
                    Pending Leave Applications 
                  </h3>
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {filteredLeaveApps.length} records
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by employee name..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="pl-10 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg w-64"
                    />
                  </div>
                  {filteredLeaveApps.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      {selectAll ? "Deselect All" : "Select All"}
                    </button>
                  )}
                </div>
              </div>

              {loadingLeaveApps ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-6 w-6 text-red-500 animate-spin" />
                  <span className="ml-2 text-gray-500">Loading pending leave applications...</span>
                </div>
              ) : filteredLeaveApps.length > 0 ? (
                <>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="w-10 px-3 py-2">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="h-4 w-4 text-red-600 rounded border-gray-300"
                              disabled={(!hasCancelPermission && !isAdmin) || !cancellationActionId}
                            />
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            Employee
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            Leave Type
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            From Date
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            To Date
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">
                            Total Days
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredLeaveApps.map((app) => {
                          const isSelected = selectedLeaveIds.includes(app.LA_id);
                          return (
                            <tr
                              key={app.LA_id}
                              className={`hover:bg-gray-50 ${
                                isSelected ? "bg-red-50" : ""
                              }`}
                            >
                              <td className="px-3 py-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectLeave(app.LA_id)}
                                  className="h-4 w-4 text-red-600 rounded border-gray-300"
                                  disabled={(!hasCancelPermission && !isAdmin) || !cancellationActionId}
                                />
                              </td>
                              <td className="px-3 py-2 font-medium text-gray-800">
                                {app.employee?.First_Name} {app.employee?.Last_Name || ""}
                              </td>
                              <td className="px-3 py-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                  {app.leave_type?.LT_name}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-gray-500">
                                {new Date(app.Fr_Date).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-2 text-gray-500">
                                {new Date(app.To_Date).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-2">
                                <span className="font-medium">{app.Tot_Days} days</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {selectedLeaveIds.length > 0 && (
                        <span className="text-red-600 font-medium">
                          ✓ {selectedLeaveIds.length} leave application selected for cancellation                          
                        </span>
                      )}
                    </div>
                  </div>                 
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="font-medium">No pending leave applications found</p>
                  <p className="text-xs mt-1">Click Generate to load pending leaves</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-end pt-6 mt-6 border-t">
          <div className="flex items-center space-x-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving || selectedLeaveIds.length == 0 || (!hasCancelPermission && !isAdmin) || !cancellationActionId}
              className={`px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 flex items-center transition-all ${
                (saving || selectedLeaveIds.length == 0 || (!hasCancelPermission && !isAdmin) || !cancellationActionId) 
                  ? "opacity-50 cursor-not-allowed" 
                  : ""
              }`}
              title={!cancellationActionId ? "Workflow not configured" : (!hasCancelPermission && !isAdmin) ? "You don't have permission to cancel leaves" : ""}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Leave ({selectedLeaveIds.length})
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditLeaveCancels;