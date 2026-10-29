// leave-encashment/addedit.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronDown,
  Search,
  ChevronUp,
  Check,
  User,
  Building,
  Wallet,
  AlertTriangle,
  RefreshCw,
  CheckSquare,
  Square,
  Trash2,
  XCircle,
  DollarSign,
  CreditCard,
  FileText,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LeaveEncashmentApi } from "../../../../services/leaveencashmentapi";

const AddEditLeaveEncashment = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false); // FIX #9: Added loading state for leave types
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle] = useState("Leave Encashment Entry");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Dropdown data
  const [financialYears, setFinancialYears] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [filteredLeaveTypes, setFilteredLeaveTypes] = useState([]);
  
  // Search states
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeHighlightedIndex, setEmployeeHighlightedIndex] = useState(-1);
  const [leaveTypeSearchTerm, setLeaveTypeSearchTerm] = useState("");
  const [isLeaveTypeDropdownOpen, setIsLeaveTypeDropdownOpen] = useState(false);
  const [leaveTypeHighlightedIndex, setLeaveTypeHighlightedIndex] = useState(-1);
  
  // Eligibility data
  const [eligibilityData, setEligibilityData] = useState(null);
  const [selectedEligibilityIds, setSelectedEligibilityIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [eligibilityFilters, setEligibilityFilters] = useState({
    employeeFilter: "",
    leaveTypeFilter: "",
    showOnlyEligible: true,
  });
  const [showEligibilityDetails, setShowEligibilityDetails] = useState(false);
  const [filteredEligibilityList, setFilteredEligibilityList] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // Encashment processing state for selected record
  const [encashmentDetails, setEncashmentDetails] = useState({
    encash_days: "",
    daily_rate: "",
    total_amount: "",
    payment_reference: "",
    payment_date: "",
    remarks: "",
  });
  
  // Form data
  const [formData, setFormData] = useState({
    fy_id: "",
    emp_id: "",
    lt_id: "",
  });
  
  // Process result
  const [processResult, setProcessResult] = useState(null);
  const [showProcessed, setShowProcessed] = useState(false);
  
  // Refs
  const fyRef = useRef(null);
  const employeeButtonRef = useRef(null);
  const leaveTypeButtonRef = useRef(null);
  const generateButtonRef = useRef(null);
  const processButtonRef = useRef(null);
  const employeeDropdownRef = useRef(null);
  const employeeSearchRef = useRef(null);
  const employeeItemRefs = useRef([]);
  const employeeListRef = useRef(null);
  const leaveTypeDropdownRef = useRef(null);
  const leaveTypeSearchRef = useRef(null);
  const leaveTypeItemRefs = useRef([]);
  const leaveTypeListRef = useRef(null);
  
  // FIX #5: Helper function to reset encashment details
  const resetEncashmentDetails = () => {
    setEncashmentDetails({
      encash_days: "",
      daily_rate: "",
      total_amount: "",
      payment_reference: "",
      payment_date: "",
      remarks: "",
    });
  };
  
  // FIX #7: Helper function to get local date (avoiding UTC issues)
  const getLocalDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Helper function to get current financial year
  const getCurrentFinancialYear = (financialYearsList) => {
    const currentDate = new Date();
    
    const currentFY = financialYearsList.find(fy => {
      const startDate = new Date(fy.St_Date);
      const endDate = new Date(fy.Ed_Date);
      return currentDate >= startDate && currentDate <= endDate;
    });
    
    return currentFY;
  };
  
  // Load initial data
  useEffect(() => {
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);
    
    loadFinancialYears();
    loadEmployees();
    loadLeaveTypes();
    
    if (id && id != "create") {
      setIsEditMode(true);
      loadEntryData();
    }
    
    // Handle click outside
    const handleClickOutside = (event) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setIsEmployeeDropdownOpen(false);
        setEmployeeHighlightedIndex(-1);
        setEmployeeSearchTerm("");
      }
      if (leaveTypeDropdownRef.current && !leaveTypeDropdownRef.current.contains(event.target)) {
        setIsLeaveTypeDropdownOpen(false);
        setLeaveTypeHighlightedIndex(-1);
        setLeaveTypeSearchTerm("");
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id, user]);
  
  // Set default financial year when loaded
  useEffect(() => {
    if (financialYears.length > 0 && !isEditMode && !formData.fy_id) {
      const currentFY = getCurrentFinancialYear(financialYears);
      
      if (currentFY) {
        setFormData(prev => ({
          ...prev,
          fy_id: currentFY.FY_Id.toString()
        }));
      }
    }
  }, [financialYears, isEditMode]);
  
  // FIX #4: Fixed race condition in filter effect
  useEffect(() => {
    if (eligibilityData && eligibilityData.eligibility_list && hasGenerated) {
      // Step 1: Apply filters to get visible records
      let filtered = [...eligibilityData.eligibility_list];
      
      if (eligibilityFilters.employeeFilter) {
        const searchTerm = eligibilityFilters.employeeFilter.toLowerCase();
        filtered = filtered.filter(item => 
          item.employee_name?.toLowerCase().includes(searchTerm)
        );
      }
      
      if (eligibilityFilters.leaveTypeFilter) {
        const searchTerm = eligibilityFilters.leaveTypeFilter.toLowerCase();
        filtered = filtered.filter(item => 
          item.leave_type?.toLowerCase().includes(searchTerm)
        );
      }
      
      if (eligibilityFilters.showOnlyEligible) {
        filtered = filtered.filter(item => item.can_encash == true);
      }
      
      setFilteredEligibilityList(filtered);
      
      // Step 2: Handle selections - DON'T automatically clear hidden selections
      setSelectedEligibilityIds(prev => {
        // Only remove selections that are no longer in ORIGINAL data
        // (e.g., data changed, not just filtered out)
        const stillValidInOriginal = prev.filter(id => {
          return eligibilityData.eligibility_list.some(item => 
            `${item.emp_id}_${item.lt_id}` == id
          );
        });
        
        // If selection changed due to data change (not filter), reset form
        if (stillValidInOriginal.length !=  prev.length) {
          if (stillValidInOriginal.length !=  1) {
            resetEncashmentDetails();
          }
          toast.warning("Some selected records are no longer available");
        }
        
        return stillValidInOriginal;
      });
    }
  }, [eligibilityData, eligibilityFilters, hasGenerated]);
  
  // Handle select all
  useEffect(() => {
    if (selectAll && hasGenerated && filteredEligibilityList.length > 0) {
      const allIds = filteredEligibilityList.map(item => `${item.emp_id}_${item.lt_id}`);
      setSelectedEligibilityIds(allIds);
      
      // Auto-select first record if single selection and no encashment details set
      if (allIds.length == 1 && !encashmentDetails.encash_days) {
        const selectedRecord = filteredEligibilityList[0];
        setEncashmentDetails({
          encash_days: selectedRecord.encashable_days?.toString() || "",
          daily_rate: selectedRecord.daily_rate?.toString() || "",
          total_amount: selectedRecord.estimated_amount?.toString() || "",
          payment_reference: "",
          payment_date: getLocalDate(), // FIX #7: Use local date
          remarks: "",
        });
      }
    } else if (selectAll == false && selectedEligibilityIds.length == filteredEligibilityList.length && hasGenerated) {
      setSelectedEligibilityIds([]);
      resetEncashmentDetails(); // FIX #5: Use reset function
    }
  }, [selectAll, filteredEligibilityList, hasGenerated]);
  
  // Update encashment details when single record is selected
  useEffect(() => {
    if (selectedEligibilityIds.length == 1 && hasGenerated && eligibilityData) {
      const selectedRecord = filteredEligibilityList.find(
        item => `${item.emp_id}_${item.lt_id}` == selectedEligibilityIds[0]
      );
      if (selectedRecord && (!encashmentDetails.encash_days || encashmentDetails.encash_days == "")) {
        setEncashmentDetails({
          encash_days: selectedRecord.encashable_days?.toString() || "",
          daily_rate: selectedRecord.daily_rate?.toString() || "",
          total_amount: selectedRecord.estimated_amount?.toString() || "",
          payment_reference: "",
          payment_date: getLocalDate(), // FIX #7: Use local date
          remarks: "",
        });
      }
    }
  }, [selectedEligibilityIds, filteredEligibilityList, hasGenerated, eligibilityData]);
  
  // Calculate total amount when encash days or daily rate changes
  useEffect(() => {
    const encashDays = parseFloat(encashmentDetails.encash_days);
    const dailyRate = parseFloat(encashmentDetails.daily_rate);
    
    if (!isNaN(encashDays) && !isNaN(dailyRate) && encashDays > 0 && dailyRate > 0) {
      const calculatedAmount = encashDays * dailyRate;
      setEncashmentDetails(prev => ({
        ...prev,
        total_amount: calculatedAmount.toFixed(2)
      }));
    } else if (encashmentDetails.total_amount !=  "") {
      // Clear total amount if inputs are invalid
      setEncashmentDetails(prev => ({
        ...prev,
        total_amount: ""
      }));
    }
  }, [encashmentDetails.encash_days, encashmentDetails.daily_rate]);
  
  // Filter employees
  useEffect(() => {
    if (!employeeSearchTerm.trim()) {
      setFilteredEmployees(employees);
    } else {
      const term = employeeSearchTerm.toLowerCase();
      const filtered = employees.filter(
        (item) =>
          item.First_Name?.toLowerCase().includes(term) ||
          item.Last_Name?.toLowerCase().includes(term) ||
          item.Emp_Code?.toLowerCase().includes(term)
      );
      setFilteredEmployees(filtered);
    }
    setEmployeeHighlightedIndex(-1);
  }, [employeeSearchTerm, employees]);
  
  // Filter leave types
  useEffect(() => {
    if (!leaveTypeSearchTerm.trim()) {
      setFilteredLeaveTypes(leaveTypes);
    } else {
      const term = leaveTypeSearchTerm.toLowerCase();
      const filtered = leaveTypes.filter((type) =>
        type.LT_name?.toLowerCase().includes(term)
      );
      setFilteredLeaveTypes(filtered);
    }
    setLeaveTypeHighlightedIndex(-1);
  }, [leaveTypeSearchTerm, leaveTypes]);
  
  const loadFinancialYears = async () => {
    try {
      const response = await LeaveEncashmentApi.getAllFinancialYears();
      if (response.success) {
        setFinancialYears(response.data);
      }
    } catch (error) {
      console.error("Error loading financial years:", error);
      toast.error("Failed to load financial years");
    }
  };
  
  const loadEmployees = async () => {
    setLoadingDropdowns(true);
    try {
      const response = await LeaveEncashmentApi.getAllEmployees();
      if (response.status && response.data) {
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoadingDropdowns(false);
    }
  };
  
  // FIX #9: Added loading state for leave types
  const loadLeaveTypes = async () => {
    setLoadingLeaveTypes(true);
    try {
      const response = await LeaveEncashmentApi.getAllLeaveTypes();
      if (response.success && response.data) {
        setLeaveTypes(response.data);
        setFilteredLeaveTypes(response.data);
      }
    } catch (error) {
      console.error("Error loading leave types:", error);
      toast.error("Failed to load leave types");
    } finally {
      setLoadingLeaveTypes(false);
    }
  };
  
  const loadEntryData = async () => {
    setLoading(true);
    try {
      const response = await LeaveEncashmentApi.getById(id);
      const entry = response?.data || response;
      
      setFormData({
        fy_id: entry?.fy_id?.toString() || "",
        emp_id: entry?.emp_id?.toString() || "",
        lt_id: entry?.lt_id?.toString() || "",
      });
      
      if (entry?.transaction || entry?.encashment_details) {
        setProcessResult({
          transaction: entry.transaction,
          employee: entry.employee,
          leave_type: entry.leave_type,
          encashment_details: entry.encashment_details,
          balance_details: entry.balance_details,
          remarks: entry.remarks,
        });
        setShowProcessed(true);
      }
    } catch (error) {
      console.error("Error loading entry:", error);
      toast.error("Failed to load encashment data!");
      navigate("/transactions/attendance-management/leave/leave-encashment");
    } finally {
      setLoading(false);
    }
  };
  
  const checkEligibility = async () => {
    if (!formData.fy_id) {
      toast.error("Please select Financial Year first");
      return;
    }
    
    setLoadingEligibility(true);
    
    try {
      // Build params object as per API documentation
      const params = {
        fy_id: parseInt(formData.fy_id),
      };
      
      if (formData.emp_id && formData.emp_id !=  "") {
        params.emp_id = parseInt(formData.emp_id);
      }
      
      if (formData.lt_id && formData.lt_id !=  "") {
        params.lt_id = parseInt(formData.lt_id);
      }
      
      // Call API as per documentation: GET /leave-encashment/eligibility
      const response = await LeaveEncashmentApi.checkEligibility(
        params.fy_id,
        params.emp_id || null,
        params.lt_id || null
      );
      
      if (response.success && response.data) {
        const eligibilityList = response.data.eligibility_list || [];
        const totalEligible = response.data.total_eligible || 0;
        
        setEligibilityData({
          fy_id: response.data.fy_id,
          total_eligible: totalEligible,
          total_encashable_days: response.data.total_encashable_days || 0,
          total_estimated_amount: response.data.total_estimated_amount || 0,
          eligibility_list: eligibilityList,
        });
        
        setFilteredEligibilityList(eligibilityList);
        setSelectedEligibilityIds([]);
        setSelectAll(false);
        
        // Reset encashment details
        resetEncashmentDetails(); // FIX #5: Use reset function
        
        if (eligibilityList.length == 0) {
          toast.error("No records found for the selected criteria");
        } else {
          toast.success(`Found ${totalEligible} eligible record(s) for encashment`);
        }
      } else {
        setEligibilityData(null);
        setFilteredEligibilityList([]);
        toast.error(response.message || "No eligible records found");
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
      setEligibilityData(null);
      setFilteredEligibilityList([]);
      
      // FIX #11: Reset generated state on error
      setHasGenerated(false);
      setShowEligibilityDetails(false);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || "Failed to check eligibility";
      toast.error(errorMessage);
    } finally {
      setLoadingEligibility(false);
    }
  };
  
  const handleGenerate = async () => {
    if (!formData.fy_id) {
      toast.error("Please select Financial Year");
      return;
    }
    
    setHasGenerated(true);
    setShowEligibilityDetails(true);
    setProcessResult(null);
    setShowProcessed(false);
    setSelectedEligibilityIds([]);
    setSelectAll(false);
    
    setEligibilityFilters({
      employeeFilter: "",
      leaveTypeFilter: "",
      showOnlyEligible: true,
    });
    
    await checkEligibility();
    
    setTimeout(() => {
      const eligibilitySection = document.getElementById('eligibility-section');
      if (eligibilitySection) {
        eligibilitySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  };
  
  // FIX #8: Improved clear filters (preserves generated data)
  const handleClearEncashmentFilters = () => {
    setFormData((prev) => ({
      ...prev,
      emp_id: "",
      lt_id: "",
    }));
    setEmployeeSearchTerm("");
    setLeaveTypeSearchTerm("");
    setIsEmployeeDropdownOpen(false);
    setIsLeaveTypeDropdownOpen(false);
    
    // Option: Refresh eligibility with cleared filters instead of resetting everything
    if (hasGenerated && formData.fy_id) {
      // Refresh eligibility with new filters
      setTimeout(() => {
        checkEligibility();
      }, 100);
    } else {
      // Only reset if no generation has happened
      setHasGenerated(false);
      setShowEligibilityDetails(false);
      setEligibilityData(null);
      setProcessResult(null);
      setShowProcessed(false);
      setSelectedEligibilityIds([]);
      setFilteredEligibilityList([]);
      resetEncashmentDetails();
    }
    
    toast.success("Filters cleared! Refreshing eligibility...");
  };
  
  const handleClearEligibilityFilters = () => {
    setEligibilityFilters({
      employeeFilter: "",
      leaveTypeFilter: "",
      showOnlyEligible: true,
    });
    setSelectedEligibilityIds([]);
    setSelectAll(false);
    resetEncashmentDetails(); // FIX #5: Use reset function
    toast.success("Filters cleared");
  };
  
  const handleToggleSelect = (id) => {
    setSelectedEligibilityIds(prev => {
      if (prev.includes(id)) {
        // If deselecting, clear encashment details if this was the only selected
        if (prev.length == 1) {
          resetEncashmentDetails(); // FIX #5: Use reset function
        }
        return prev.filter(i => i !=  id);
      } else {
        // Clear previous selection if we're moving to single selection mode
        if (prev.length == 0) {
          const selectedRecord = filteredEligibilityList.find(item => `${item.emp_id}_${item.lt_id}` == id);
          if (selectedRecord) {
            setEncashmentDetails({
              encash_days: selectedRecord.encashable_days?.toString() || "",
              daily_rate: selectedRecord.daily_rate?.toString() || "",
              total_amount: selectedRecord.estimated_amount?.toString() || "",
              payment_reference: "",
              payment_date: getLocalDate(), // FIX #7: Use local date
              remarks: "",
            });
          }
        } else if (prev.length == 1) {
          // If we already have one selected and selecting another, clear encashment details
          resetEncashmentDetails(); // FIX #5: Use reset function
        }
        return [...prev, id];
      }
    });
    setSelectAll(false);
  };
  
  const handleSelectAll = () => {
    if (selectedEligibilityIds.length == filteredEligibilityList.length && filteredEligibilityList.length > 0) {
      setSelectedEligibilityIds([]);
      setSelectAll(false);
      resetEncashmentDetails(); // FIX #5: Use reset function
    } else if (filteredEligibilityList.length > 0) {
      setSelectAll(true);
    }
  };
  
  const handleClearSelection = () => {
    setSelectedEligibilityIds([]);
    setSelectAll(false);
    resetEncashmentDetails(); // FIX #5: Use reset function
    toast.success("Selection cleared");
  };
  
  const handleEncashmentInputChange = (e) => {
    const { name, value } = e.target;
    setEncashmentDetails(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  
  const validateEncashmentForm = () => {
    const newErrors = {};
    
    if (selectedEligibilityIds.length !=  1) {
      newErrors.selection = "Please select exactly one record to encash";
    }
    
    if (!encashmentDetails.encash_days || parseFloat(encashmentDetails.encash_days) <= 0) {
      newErrors.encash_days = "Please enter valid encashment days";
    }
    
    if (!encashmentDetails.daily_rate || parseFloat(encashmentDetails.daily_rate) <= 0) {
      newErrors.daily_rate = "Please enter valid daily rate";
    }
    
    // FIX #10: Added daily rate reasonableness validation
    if (encashmentDetails.daily_rate && parseFloat(encashmentDetails.daily_rate) > 100000) {
      toast.warning("Daily rate seems unusually high. Please verify.");
    }
    
    if (!encashmentDetails.payment_date) {
      newErrors.payment_date = "Please select payment date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };
  
  const handleProcessEncashment = async () => {
    if (selectedEligibilityIds.length !=  1) {
      toast.error("Please select exactly one record to process encashment");
      return;
    }
    
    const isValid = validateEncashmentForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }
    
    const selectedRecord = filteredEligibilityList.find(
      item => `${item.emp_id}_${item.lt_id}` == selectedEligibilityIds[0]
    );
    
    if (!selectedRecord) {
      toast.error("Selected record not found");
      return;
    }
    
    const encashDays = parseFloat(encashmentDetails.encash_days);
    
    // Validate against max encashable days
    if (selectedRecord.max_encash_days && encashDays > selectedRecord.max_encash_days) {
      toast.error(`Maximum encashable days allowed is ${selectedRecord.max_encash_days}`);
      return;
    }
    
    // Validate against available encashable days
    if (encashDays > selectedRecord.encashable_days) {
      toast.error(`Insufficient balance. Available: ${selectedRecord.encashable_days} days, Requested: ${encashDays} days`);
      return;
    }
    
    // Check if encashment is allowed
    if (!selectedRecord.can_encash) {
      toast.error(selectedRecord.remarks || "Encashment not allowed for this leave type");
      return;
    }
    
    const result = await Swal.fire({
      title: "Process Leave Encashment?",
      html: `
        <div class="text-left">
          <p class="mb-2">Are you sure you want to process leave encashment?</p>
          <div class="bg-gray-50 p-3 rounded-lg mt-3">
            <p class="text-sm"><strong>Employee:</strong> ${selectedRecord.employee_name}</p>
            <p class="text-sm"><strong>Leave Type:</strong> ${selectedRecord.leave_type}</p>
            <p class="text-sm"><strong>Financial Year:</strong> ${getFinancialYearName(formData.fy_id)}</p>
            <p class="text-sm"><strong>Encashment Days:</strong> ${encashDays} days</p>
            <p class="text-sm"><strong>Daily Rate:</strong> ₹${parseFloat(encashmentDetails.daily_rate).toLocaleString()}</p>
            <p class="text-sm"><strong>Total Amount:</strong> ₹${parseFloat(encashmentDetails.total_amount).toLocaleString()}</p>
            ${encashmentDetails.payment_reference ? `<p class="text-sm"><strong>Payment Reference:</strong> ${encashmentDetails.payment_reference}</p>` : ''}
          </div>
          <p class="text-amber-600 text-sm mt-3">⚠️ This action will deduct leave days and cannot be undone.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, process encashment!",
      cancelButtonText: "Cancel",
    });
    
    if (!result.isConfirmed) return;
    
    setSaving(true);
    try {
      // Prepare payload as per API documentation: POST /leave-encashment
      const payload = {
        emp_id: selectedRecord.emp_id,
        lt_id: selectedRecord.lt_id,
        fy_id: parseInt(formData.fy_id),
        encash_days: encashDays,
        daily_rate: parseFloat(encashmentDetails.daily_rate),
        total_amount: parseFloat(encashmentDetails.total_amount),
        payment_date: encashmentDetails.payment_date,
        remarks: encashmentDetails.remarks || `Encashment of ${encashDays} days for ${selectedRecord.leave_type}`,
      };
      
      if (encashmentDetails.payment_reference && encashmentDetails.payment_reference.trim() !=  "") {
        payload.payment_reference = encashmentDetails.payment_reference;
      }
      
      const response = await LeaveEncashmentApi.processEncashment(payload);
      
      if (response.success) {
        setProcessResult(response.data);
        setShowProcessed(true);
        
        toast.success(response.message || "Leave encashment processed successfully!");
        
        // Clear selection and refresh eligibility
        setSelectedEligibilityIds([]);
        setSelectAll(false);
        resetEncashmentDetails(); // FIX #5: Use reset function
        
        // Refresh eligibility after processing
        await checkEligibility();
        
        setTimeout(() => {
          const resultsSection = document.getElementById('results-section');
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      } else {
        toast.error(response.message || "Failed to process encashment");
      }
    } catch (error) {
      console.error("Error processing encashment:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to process encashment. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    setHasGenerated(false);
    setShowEligibilityDetails(false);
    setEligibilityData(null);
    setProcessResult(null);
    setShowProcessed(false);
    setSelectedEligibilityIds([]);
    setFilteredEligibilityList([]);
    resetEncashmentDetails(); // FIX #5: Use reset function
  };
  
  // Employee dropdown handlers
  const handleEmployeeKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter" || e.key == " ") {
      e.preventDefault();
      setIsEmployeeDropdownOpen(true);
      setEmployeeSearchTerm("");
      setEmployeeHighlightedIndex(-1);
      setTimeout(() => employeeSearchRef.current?.focus(), 0);
    }
  };
  
  const handleEmployeeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredEmployees.length > 0) {
        setEmployeeHighlightedIndex(0);
        setTimeout(() => employeeItemRefs.current[0]?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmployeeDropdownOpen(false);
      setEmployeeHighlightedIndex(-1);
      setEmployeeSearchTerm("");
      employeeButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredEmployees.length > 0 && employeeHighlightedIndex >= 0) {
        handleEmployeeSelect(filteredEmployees[employeeHighlightedIndex]);
      } else if (filteredEmployees.length > 0) {
        handleEmployeeSelect(filteredEmployees[0]);
      }
    }
  };
  
  const handleEmployeeItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredEmployees.length) {
        setEmployeeHighlightedIndex(nextIndex);
        setTimeout(() => employeeItemRefs.current[nextIndex]?.focus(), 0);
      } else {
        setEmployeeHighlightedIndex(-1);
        setTimeout(() => employeeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setEmployeeHighlightedIndex(-1);
        setTimeout(() => employeeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setEmployeeHighlightedIndex(prevIndex);
        setTimeout(() => employeeItemRefs.current[prevIndex]?.focus(), 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleEmployeeSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmployeeDropdownOpen(false);
      setEmployeeHighlightedIndex(-1);
      setEmployeeSearchTerm("");
      employeeButtonRef.current?.focus();
    }
  };
  
  const handleEmployeeSelect = (item) => {
    setFormData((prev) => ({
      ...prev,
      emp_id: item.Emp_Id.toString(),
    }));
    setIsEmployeeDropdownOpen(false);
    setEmployeeSearchTerm("");
    setEmployeeHighlightedIndex(-1);
    
    if (errors.emp_id) {
      setErrors((prev) => ({ ...prev, emp_id: "" }));
    }
  };
  
  const getSelectedEmployeeName = () => {
    if (!formData.emp_id) return "";
    const selected = employees.find((item) => item.Emp_Id == parseInt(formData.emp_id));
    return selected ? `${selected.First_Name} ${selected.Last_Name || ""}`.trim() : "";
  };
  
  // Leave type dropdown handlers
  const handleLeaveTypeKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter" || e.key == " ") {
      e.preventDefault();
      setIsLeaveTypeDropdownOpen(true);
      setLeaveTypeSearchTerm("");
      setLeaveTypeHighlightedIndex(-1);
      setTimeout(() => leaveTypeSearchRef.current?.focus(), 0);
    }
  };
  
  const handleLeaveTypeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredLeaveTypes.length > 0) {
        setLeaveTypeHighlightedIndex(0);
        setTimeout(() => leaveTypeItemRefs.current[0]?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLeaveTypeDropdownOpen(false);
      setLeaveTypeHighlightedIndex(-1);
      setLeaveTypeSearchTerm("");
      leaveTypeButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredLeaveTypes.length > 0 && leaveTypeHighlightedIndex >= 0) {
        handleLeaveTypeSelect(filteredLeaveTypes[leaveTypeHighlightedIndex]);
      } else if (filteredLeaveTypes.length > 0) {
        handleLeaveTypeSelect(filteredLeaveTypes[0]);
      }
    }
  };
  
  const handleLeaveTypeItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredLeaveTypes.length) {
        setLeaveTypeHighlightedIndex(nextIndex);
        setTimeout(() => leaveTypeItemRefs.current[nextIndex]?.focus(), 0);
      } else {
        setLeaveTypeHighlightedIndex(-1);
        setTimeout(() => leaveTypeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setLeaveTypeHighlightedIndex(-1);
        setTimeout(() => leaveTypeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setLeaveTypeHighlightedIndex(prevIndex);
        setTimeout(() => leaveTypeItemRefs.current[prevIndex]?.focus(), 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleLeaveTypeSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLeaveTypeDropdownOpen(false);
      setLeaveTypeHighlightedIndex(-1);
      setLeaveTypeSearchTerm("");
      leaveTypeButtonRef.current?.focus();
    }
  };
  
  const handleLeaveTypeSelect = (item) => {
    setFormData((prev) => ({
      ...prev,
      lt_id: item.LT_id.toString(),
    }));
    setIsLeaveTypeDropdownOpen(false);
    setLeaveTypeSearchTerm("");
    setLeaveTypeHighlightedIndex(-1);
    
    if (errors.lt_id) {
      setErrors((prev) => ({ ...prev, lt_id: "" }));
    }
  };
  
  const getSelectedLeaveTypeName = () => {
    if (!formData.lt_id) return "";
    const selected = leaveTypes.find((item) => item.LT_id == parseInt(formData.lt_id));
    return selected ? selected.LT_name : "";
  };
  
  const handleCancel = () => {
    navigate("/transactions/attendance-management/leave/leave-encashment");
  };
  
  const getFinancialYearName = (fyId) => {
    const fy = financialYears.find(f => f.FY_Id == fyId);
    return fy ? fy.FY_Name : `FY #${fyId}`;
  };
  
  if (loading && isEditMode) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/transactions/attendance-management/leave/leave-encashment")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit" : "New"} {pageTitle}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "View encashment record details"
                : "Process leave encashment for employees"}
            </p>
          </div>
        </div>
      </div>
      
      <form className="space-y-8">
        {/* Main Form Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <DollarSign className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Encashment Details
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Financial Year *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  ref={fyRef}
                  name="fy_id"
                  value={formData.fy_id}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.fy_id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isEditMode}
                >
                  <option value="">Select Financial Year</option>
                  {financialYears.map(fy => (
                    <option key={fy.FY_Id} value={fy.FY_Id}>
                      {fy.FY_Name} ({new Date(fy.St_Date).toLocaleDateString()} - {new Date(fy.Ed_Date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {errors.fy_id && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.fy_id && (
                <p className="mt-1 text-sm text-red-600">{errors.fy_id}</p>
              )}
            </div>
            
            {/* Employee Dropdown */}
            <div className="relative" ref={employeeDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee 
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingDropdowns ? (
                  <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading employees...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={employeeButtonRef}
                      type="button"
                      onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                      onKeyDown={handleEmployeeKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white truncate ${
                        formData.emp_id ? "text-gray-900" : "text-gray-500"
                      }`}
                      disabled={isEditMode}
                    >
                      {formData.emp_id ? getSelectedEmployeeName() : "All Employees"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isEmployeeDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
              </div>
              
              {isEmployeeDropdownOpen && !loadingDropdowns && (
                <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={employeeSearchRef}
                        type="text"
                        value={employeeSearchTerm}
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                        onKeyDown={handleEmployeeSearchKeyDown}
                        placeholder="Search by name or code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div ref={employeeListRef} className="overflow-y-auto max-h-64">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((item, idx) => (
                        <button
                          key={item.Emp_Id}
                          ref={(el) => { employeeItemRefs.current[idx] = el; }}
                          type="button"
                          onClick={() => handleEmployeeSelect(item)}
                          onKeyDown={(e) => handleEmployeeItemKeyDown(e, item, idx)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                            employeeHighlightedIndex == idx ? "bg-blue-100" : ""
                          }`}
                          tabIndex={0}
                        >
                          <div className="font-medium text-gray-900">
                            {item.First_Name} 
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <p>No employees found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Leave Type Dropdown - FIX #9: Added loading state */}
            <div className="relative" ref={leaveTypeDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingLeaveTypes ? (
                  <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500">Loading leave types...</span>
                  </div>
                ) : (
                  <>
                    <button
                      ref={leaveTypeButtonRef}
                      type="button"
                      onClick={() => setIsLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen)}
                      onKeyDown={handleLeaveTypeKeyDown}
                      className={`w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white truncate ${
                        formData.lt_id ? "text-gray-900" : "text-gray-500"
                      }`}
                      disabled={isEditMode}
                    >
                      {formData.lt_id ? getSelectedLeaveTypeName() : "All Leave Types"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {isLeaveTypeDropdownOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
              </div>
              
              {isLeaveTypeDropdownOpen && !loadingLeaveTypes && (
                <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={leaveTypeSearchRef}
                        type="text"
                        value={leaveTypeSearchTerm}
                        onChange={(e) => setLeaveTypeSearchTerm(e.target.value)}
                        onKeyDown={handleLeaveTypeSearchKeyDown}
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div ref={leaveTypeListRef} className="overflow-y-auto max-h-64">
                    {filteredLeaveTypes.length > 0 ? (
                      filteredLeaveTypes.map((item, idx) => (
                        <button
                          key={item.LT_id}
                          ref={(el) => { leaveTypeItemRefs.current[idx] = el; }}
                          type="button"
                          onClick={() => handleLeaveTypeSelect(item)}
                          onKeyDown={(e) => handleLeaveTypeItemKeyDown(e, item, idx)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                            leaveTypeHighlightedIndex == idx ? "bg-blue-100" : ""
                          }`}
                          tabIndex={0}
                        >
                          <div className="font-medium text-gray-900">{item.LT_name}</div>
                          <div className="text-xs text-gray-500">
                            Max Days: {item.Max_days} | {item.Is_Paid ? "Paid" : "Unpaid"}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <p>No leave types found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div></div> {/* Empty div for spacing */}
          </div>
          
          {/* Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
            <div className="flex items-center gap-3">            
              <button
                ref={generateButtonRef}
                type="button"
                onClick={handleGenerate}
                disabled={!formData.fy_id || loadingEligibility}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingEligibility ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate & Check Eligibility
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClearEncashmentFilters}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center transition-all border border-gray-300"
                title="Clear employee and leave type filters"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Eligibility Section - Only shows after Generate button click */}
        {showEligibilityDetails && hasGenerated && eligibilityData && (
          <div id="eligibility-section" className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Eligibility Results
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                Total Eligible: {eligibilityData.total_eligible} | 
                Total Encashable Days: {eligibilityData.total_encashable_days || 0} |
                Selected: {selectedEligibilityIds.length}
              </div>
            </div>
            
            {eligibilityData && eligibilityData.total_eligible > 0 ? (
              <>
                {/* Selection Actions */}
                <div className="mb-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center hover:bg-blue-100 transition-colors"
                  >
                    {selectedEligibilityIds.length == filteredEligibilityList.length && filteredEligibilityList.length > 0 ? (
                      <CheckSquare className="h-4 w-4 mr-1" />
                    ) : (
                      <Square className="h-4 w-4 mr-1" />
                    )}
                    {selectedEligibilityIds.length == filteredEligibilityList.length && filteredEligibilityList.length > 0 ? "Deselect All" : "Select All"}
                  </button>
                  {selectedEligibilityIds.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center hover:bg-gray-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear Selection
                      </button>
                    </>
                  )}
                </div>
                
                {/* Eligibility Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-10 px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={filteredEligibilityList.length > 0 && selectedEligibilityIds.length == filteredEligibilityList.length}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Remaining Days</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Max Encashable</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Encashable Days</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Daily Rate (₹)</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Est. Amount (₹)</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Eligible</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEligibilityList.map((item, idx) => {
                        const itemId = `${item.emp_id}_${item.lt_id}`;
                        const isSelected = selectedEligibilityIds.includes(itemId);
                        return (
                          <tr 
                            key={idx} 
                            className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                            onClick={() => handleToggleSelect(itemId)}
                          >
                            <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelect(itemId)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.employee_name || `Employee #${item.emp_id}`}
                              {item.employee_code && (
                                <div className="text-xs text-gray-500">{item.employee_code}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.leave_type || `Leave Type #${item.lt_id}`}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium">
                              {item.remaining_days} days
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              {item.max_encash_days || '-'} days
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                              {item.encashable_days} days
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              ₹{item.daily_rate?.toLocaleString() || '0'}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-blue-600 font-semibold">
                              ₹{item.estimated_amount?.toLocaleString() || '0'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {item.can_encash ? (
                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-600 mx-auto" />
                              )}
                             </td>
                           </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {filteredEligibilityList.length == 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                    <p className="text-gray-600">No records match the filters</p>
                    <button
                      type="button"
                      onClick={handleClearEligibilityFilters}
                      className="mt-3 px-4 py-2 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                <p className="text-gray-600">No employees found for encashment</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try selecting a different financial year or check if there are leave balances
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Encashment Form Section - Shows when single record is selected */}
        {selectedEligibilityIds.length == 1 && hasGenerated && eligibilityData && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mr-3">
                <Wallet className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Encashment Details
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encashment Days *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="encash_days"
                    value={encashmentDetails.encash_days}
                    onChange={handleEncashmentInputChange}
                    step="0.5"
                    min="0.5"
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.encash_days ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter number of days"
                  />
                </div>
                {errors.encash_days && (
                  <p className="mt-1 text-sm text-red-600">{errors.encash_days}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Rate (₹) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="daily_rate"
                    value={encashmentDetails.daily_rate}
                    onChange={handleEncashmentInputChange}
                    step="1"
                    min="0"
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.daily_rate ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Daily rate amount"
                  />
                </div>
                {errors.daily_rate && (
                  <p className="mt-1 text-sm text-red-600">{errors.daily_rate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount (₹)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="total_amount"
                    value={encashmentDetails.total_amount}
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Auto-calculated</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="payment_date"
                    value={encashmentDetails.payment_date}
                    onChange={handleEncashmentInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.payment_date ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                {errors.payment_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.payment_date}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Reference
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="payment_reference"
                    value={encashmentDetails.payment_reference}
                    onChange={handleEncashmentInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., ENC/2026/EL/001"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    name="remarks"
                    value={encashmentDetails.remarks}
                    onChange={handleEncashmentInputChange}
                    rows="3"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter any additional remarks..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Process Results Section */}
        {showProcessed && processResult && (
          <div id="results-section" className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                <Check className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Encashment Processed Successfully
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Encashment Summary</span>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600 mt-2">
                  {processResult.encashment_details?.encash_days || 0} days
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Amount: ₹{(processResult.encashment_details?.total_amount || 0).toLocaleString()}
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Balance Update</span>
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  {processResult.balance_details?.new_balance || 0} days
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Previous: {processResult.balance_details?.previous_balance || 0} days
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Employee Details</p>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {processResult.employee?.name || processResult.employee?.employee_name || '-'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Code:</strong> {processResult.employee?.code || processResult.employee?.employee_code || '-'}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Leave Type</p>
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong> {processResult.leave_type?.name || processResult.leave_type?.leave_type || '-'}
                </p>
              </div>
              
              {processResult.encashment_details?.payment_reference && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Payment Reference</p>
                  <p className="text-sm text-gray-600">{processResult.encashment_details.payment_reference}</p>
                </div>
              )}
              
              {processResult.remarks && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Remarks</p>
                  <p className="text-sm text-gray-600">{processResult.remarks}</p>
                </div>
              )}
              
              {processResult.transaction && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Transaction Details</p>
                  <p className="text-sm text-gray-600">
                    <strong>Transaction ID:</strong> {processResult.transaction.LTr_id || '-'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Transaction Date:</strong> {processResult.transaction.Tr_Date ? new Date(processResult.transaction.Tr_Date).toLocaleDateString() : '-'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={processButtonRef}
              type="button"
              onClick={handleProcessEncashment}
              disabled={saving || !hasGenerated || selectedEligibilityIds.length !=  1}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Process Encashment
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditLeaveEncashment;