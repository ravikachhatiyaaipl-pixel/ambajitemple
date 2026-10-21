// leave-carryforward-entry/addedit.jsx
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
  AlertTriangle,
  RefreshCw,
  Square,
  CheckSquare,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LeaveCarryForwardApi } from "../../../../services/leavecarryforwardapi";

const AddEditLeaveCarryForward = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Leave Carry Forward Entry");
  const [isAdmin, setIsAdmin] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ show: false, current: 0, total: 0 });
  
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
  
  // Form data
  const [formData, setFormData] = useState({
    from_fy_id: "",
    to_fy_id: "",
    emp_id: "",
    lt_id: "",
    auto_carry: true,
  });
  
  // Process result with enhanced structure
  const [processResult, setProcessResult] = useState(null);
  const [showProcessed, setShowProcessed] = useState(false);
  
  // Refs
  const fromFyRef = useRef(null);
  const toFyRef = useRef(null);
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
  
  // Helper function to get next financial year
  const getNextFinancialYear = (financialYearsList, currentFYId) => {
    const currentIndex = financialYearsList.findIndex(fy => fy.FY_Id == currentFYId);
    if (currentIndex !=  -1 && currentIndex + 1 < financialYearsList.length) {
      return financialYearsList[currentIndex + 1];
    }
    return null;
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
  
  // Set default financial years when they are loaded
  useEffect(() => {
    if (financialYears.length > 0 && !isEditMode && !formData.from_fy_id && !formData.to_fy_id) {
      const currentFY = getCurrentFinancialYear(financialYears);
      
      if (currentFY) {
        setFormData(prev => ({
          ...prev,
          from_fy_id: currentFY.FY_Id.toString()
        }));
        
        const nextFY = getNextFinancialYear(financialYears, currentFY.FY_Id);
        if (nextFY) {
          setFormData(prev => ({
            ...prev,
            to_fy_id: nextFY.FY_Id.toString()
          }));
        }
      }
    }
  }, [financialYears, isEditMode]);
  
  // Filter eligibility list based on filters
  useEffect(() => {
    if (eligibilityData && eligibilityData.eligibility_list && hasGenerated) {
      let filtered = [...eligibilityData.eligibility_list];
      
      if (eligibilityFilters.employeeFilter) {
        filtered = filtered.filter(item => 
          item.employee_name?.toLowerCase().includes(eligibilityFilters.employeeFilter.toLowerCase())
        );
      }
      
      if (eligibilityFilters.leaveTypeFilter) {
        filtered = filtered.filter(item => 
          item.leave_type?.toLowerCase().includes(eligibilityFilters.leaveTypeFilter.toLowerCase())
        );
      }
      
      if (eligibilityFilters.showOnlyEligible) {
        filtered = filtered.filter(item => item.eligible_days > 0);
      }
      
      setFilteredEligibilityList(filtered);
      
      // Filter selections to only valid ones in current filtered list
      const validSelections = selectedEligibilityIds.filter(id => 
        filtered.some(item => `${item.emp_id}_${item.lt_id}` == id)
      );
      
      if (validSelections.length !=  selectedEligibilityIds.length) {
        setSelectedEligibilityIds(validSelections);
      }
    }
  }, [eligibilityData, eligibilityFilters, hasGenerated]);
  
  // Handle select all
  useEffect(() => {
    if (selectAll && hasGenerated && filteredEligibilityList.length > 0) {
      const allIds = filteredEligibilityList.map(item => `${item.emp_id}_${item.lt_id}`);
      setSelectedEligibilityIds(allIds);
    } else if (selectAll == false && selectedEligibilityIds.length == filteredEligibilityList.length && hasGenerated) {
      setSelectedEligibilityIds([]);
    }
  }, [selectAll, filteredEligibilityList, hasGenerated]);
  
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
      const response = await LeaveCarryForwardApi.getAllFinancialYears();
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
      const response = await LeaveCarryForwardApi.getAllEmployees();
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
  
  const loadLeaveTypes = async () => {
    try {
      const response = await LeaveCarryForwardApi.getAllLeaveTypes();
      if (response.success && response.data) {
        setLeaveTypes(response.data);
        setFilteredLeaveTypes(response.data);
      }
    } catch (error) {
      console.error("Error loading leave types:", error);
      toast.error("Failed to load leave types");
    }
  };
  
  const loadEntryData = async () => {
    setLoading(true);
    try {
      const response = await LeaveCarryForwardApi.getById(id);
      const entry = response?.data || response;
      
      setFormData({
        from_fy_id: entry?.from_fy_id?.toString() || "",
        to_fy_id: entry?.to_fy_id?.toString() || "",
        emp_id: entry?.emp_id?.toString() || "",
        lt_id: entry?.lt_id?.toString() || "",
        auto_carry: entry?.auto_carry ?? true,
      });
      
      if (entry?.carried_forward || entry?.carry_forward_list) {
        setProcessResult({
          carried_forward: entry.carried_forward || entry.carry_forward_list,
          lapsed: entry.lapsed || entry.lapsed_list,
          total_carried_forward_days: entry.total_carried_forward_days,
          total_lapsed_days: entry.total_lapsed_days,
        });
        setShowProcessed(true);
      }
    } catch (error) {
      console.error("Error loading entry:", error);
      toast.error("Failed to load carry forward data!");
      navigate("/transactions/attendance-management/leave/leave-carryforward-entry");
    } finally {
      setLoading(false);
    }
  };
  
  const checkEligibility = async () => {
    if (!formData.from_fy_id) {
      toast.error("Please select From Financial Year first");
      return;
    }
    
    setLoadingEligibility(true);
    
    try {
      const params = {
        from_fy_id: parseInt(formData.from_fy_id),
      };
      
      if (formData.emp_id) {
        params.emp_id = parseInt(formData.emp_id);
      }
      
      if (formData.lt_id) {
        params.lt_id = parseInt(formData.lt_id);
      }
      
      const response = await LeaveCarryForwardApi.checkEligibility(
        params.from_fy_id,
        params.emp_id || null,
        params.lt_id || null
      );
      
      if (response.success && response.data) {
        const eligibilityList = response.data.eligibility_list || [];
        const totalEligible = response.data.total_eligible || 0;
        
        setEligibilityData({
          from_fy_id: response.data.from_fy_id,
          total_eligible: totalEligible,
          eligibility_list: eligibilityList,
        });
        
        setFilteredEligibilityList(eligibilityList);
        setSelectedEligibilityIds([]);
        setSelectAll(false);
        
        if (eligibilityList.length == 0) {
          // FIXED: Using toast.custom instead of plain toast with icon
          toast.custom((t) => (
            <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg shadow-lg border border-blue-200">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>ℹ️ No records found for the selected criteria</span>
              </div>
            </div>
          ), { duration: 3000 });
        } else {
          toast.success(`Found ${totalEligible} record(s) for carry forward`);
        }
      } else {
        setEligibilityData(null);
        setFilteredEligibilityList([]);
        // FIXED: Using toast.custom for info message
        toast.custom((t) => (
          <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg shadow-lg border border-blue-200">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{response.message || "No records found"}</span>
            </div>
          </div>
        ), { duration: 3000 });
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
      setEligibilityData(null);
      setFilteredEligibilityList([]);
      toast.error(error.response?.data?.message || "Check eligibility Data Not Available");
    } finally {
      setLoadingEligibility(false);
    }
  };
  
  const handleGenerate = async () => {
    if (!formData.from_fy_id || !formData.to_fy_id) {
      toast.error("Please select both From and To Financial Years");
      return;
    }
    
    if (formData.from_fy_id == formData.to_fy_id) {
      toast.error("From and To Financial Years must be different");
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
  
  const handleClearCarryForwardFilters = () => {
    setFormData((prev) => ({
      ...prev,
      emp_id: "",
      lt_id: "",
    }));
    setEmployeeSearchTerm("");
    setLeaveTypeSearchTerm("");
    setIsEmployeeDropdownOpen(false);
    setIsLeaveTypeDropdownOpen(false);
    
    setHasGenerated(false);
    setShowEligibilityDetails(false);
    setEligibilityData(null);
    setProcessResult(null);
    setShowProcessed(false);
    setSelectedEligibilityIds([]);
    setFilteredEligibilityList([]);
    
    toast.success("Filters cleared!");
  };
  
  const handleClearEligibilityFilters = () => {
    setEligibilityFilters({
      employeeFilter: "",
      leaveTypeFilter: "",
      showOnlyEligible: true,
    });
    setSelectedEligibilityIds([]);
    setSelectAll(false);
    toast.success("Filters cleared");
  };
  
  const handleToggleSelect = (id) => {
    setSelectedEligibilityIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !=  id);
      } else {
        return [...prev, id];
      }
    });
    setSelectAll(false);
  };
  
  const handleSelectAll = () => {
    if (selectedEligibilityIds.length == filteredEligibilityList.length && filteredEligibilityList.length > 0) {
      setSelectedEligibilityIds([]);
      setSelectAll(false);
    } else {
      setSelectAll(true);
    }
  };
  
  const handleClearSelection = () => {
    setSelectedEligibilityIds([]);
    setSelectAll(false);
    toast.success("Selection cleared");
  };
  
  // FIXED: Check if processing is allowed with current selections
  const canProcess = () => {
    if (saving) return false;
    if (!hasGenerated) return false;
    if (selectedEligibilityIds.length == 0) return false;
    
    // Validate that selected IDs still exist in current filtered list
    const validSelections = selectedEligibilityIds.filter(id => 
      filteredEligibilityList.some(item => `${item.emp_id}_${item.lt_id}` == id)
    );
    
    if (validSelections.length !=  selectedEligibilityIds.length && validSelections.length > 0) {
      // Update selections to only valid ones
      setSelectedEligibilityIds(validSelections);
      toast.custom((t) => (
        <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg shadow-lg border border-yellow-200">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Some selections were invalid and have been removed</span>
          </div>
        </div>
      ), { duration: 3000 });
      return false;
    }
    
    return validSelections.length > 0;
  };
  
  // UPDATED: Process selected records with improved error handling and balance verification
  const handleProcessSelected = async () => {
    if (selectedEligibilityIds.length == 0) {
      toast.error("Please select at least one record to process");
      return;
    }
    
    const selectedRecords = filteredEligibilityList.filter(item => 
      selectedEligibilityIds.includes(`${item.emp_id}_${item.lt_id}`)
    );
    
    const totalEligibleDays = selectedRecords.reduce((sum, item) => sum + item.eligible_days, 0);
    
    const result = await Swal.fire({
      title: "Process Selected Records?",
      html: `
        <div class="text-left">
          <p class="mb-2">Are you sure you want to process the selected records?</p>
          <div class="bg-gray-50 p-3 rounded-lg mt-3">
            <p class="text-sm"><strong>From FY:</strong> ${getFinancialYearName(formData.from_fy_id)}</p>
            <p class="text-sm"><strong>To FY:</strong> ${getFinancialYearName(formData.to_fy_id)}</p>
            <p class="text-sm"><strong>Selected Records:</strong> ${selectedEligibilityIds.length}</p>
            <p class="text-sm"><strong>Total Eligible Days:</strong> ${totalEligibleDays} days</p>
          </div>
          <p class="text-amber-600 text-sm mt-3">⚠️ This action will create transactions and cannot be undone.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, process selected!",
      cancelButtonText: "Cancel",
    });
    
    if (!result.isConfirmed) return;
    
    setSaving(true);
    setBatchProgress({ show: true, current: 0, total: selectedRecords.length });
    
    try {
      // Group selected records by employee and leave type
      const uniqueCombinations = [];
      const seen = new Set();
      
      selectedRecords.forEach(record => {
        const key = `${record.emp_id}_${record.lt_id}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueCombinations.push({
            emp_id: record.emp_id,
            lt_id: record.lt_id,
            employee_name: record.employee_name,
            leave_type: record.leave_type,
            eligible_days: record.eligible_days
          });
        }
      });
      
      // Use the enhanced batch processing method
      const batchResult = await LeaveCarryForwardApi.batchProcessCarryForward(
        parseInt(formData.from_fy_id),
        parseInt(formData.to_fy_id),
        uniqueCombinations,
        formData.auto_carry,
        (progress) => {
          setBatchProgress({
            show: true,
            current: progress.current,
            total: progress.total,
            currentCombo: progress.currentCombo
          });
        }
      );
      
      if (batchResult.total_success > 0) {
        // STEP 3 FROM FLOW DIAGRAM: Verify balances after processing
        const successfulRecords = batchResult.success_records.map(record => ({
          emp_id: record.emp_id,
          lt_id: record.lt_id,
          employee_name: record.employee_name,
          leave_type: record.leave_type
        }));
        
        let balanceVerifications = [];
if (successfulRecords.length > 0) {
  toast.custom((t) => (
    <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg shadow-lg">
      <div className="flex items-center">
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        <span>Verifying balances...</span>
      </div>
    </div>
  ), { duration: 2000 });
  
  try {
    const verifyResult = await LeaveCarryForwardApi.verifyMultipleBalances(
      successfulRecords,
      parseInt(formData.to_fy_id)
    );
    balanceVerifications = verifyResult.verifications;
            
            if (verifyResult.failed > 0) {
              toast.custom((t) => (
                <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg shadow-lg border border-yellow-200">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span>⚠️ {verifyResult.success} balances verified, {verifyResult.failed} failed to verify</span>
                  </div>
                </div>
              ), { duration: 5000 });
            } else {
              toast.success(`✅ All ${verifyResult.success} balances verified successfully!`);
            }
          } catch (verifyError) {
            console.error("Balance verification error:", verifyError);
            toast.error("Could not verify all balances, but records were processed");
          }
        }
        
        // Set process result with verification data
        setProcessResult({
          ...batchResult,
          balance_verifications: balanceVerifications,
          total_carried_forward_days: batchResult.total_carried_forward_days,
          total_lapsed_days: batchResult.total_lapsed_days,
          carried_forward: batchResult.carried_forward,
          lapsed: batchResult.lapsed
        });
        setShowProcessed(true);
        
        // Show detailed success/failure message
        if (batchResult.total_failed > 0) {
          toast.custom((t) => (
            <div className="bg-orange-50 text-orange-800 px-4 py-3 rounded-lg shadow-lg border border-orange-200 max-w-md">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Partial Success</p>
                  <p className="text-sm">✅ {batchResult.total_success} record(s) processed successfully</p>
                  <p className="text-sm">❌ {batchResult.total_failed} record(s) failed</p>
                  <button 
                    onClick={() => {
                      toast.dismiss(t.id);
                      // Show failed records details
                      const failedList = batchResult.failed_records.map(f => 
                        `• ${f.employee_name} - ${f.leave_type}: ${f.reason}`
                      ).join('\n');
                      Swal.fire({
                        title: 'Failed Records',
                        html: `<pre class="text-left text-sm">${failedList}</pre>`,
                        icon: 'warning'
                      });
                    }}
                    className="text-xs text-orange-700 underline mt-1"
                  >
                    View failed records
                  </button>
                </div>
              </div>
            </div>
          ), { duration: 8000 });
        } else {
          toast.success(`✅ Successfully processed ${batchResult.total_success} records! Balances verified.`);
        }
        
        setSelectedEligibilityIds([]);
        setSelectAll(false);
        
        // Refresh eligibility after processing
        await checkEligibility();
        
        setTimeout(() => {
          const resultsSection = document.getElementById('results-section');
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      } else {
        toast.error("Failed to process selected records. Please check the error details.");
        
        // Show detailed errors
        if (batchResult.failed_records && batchResult.failed_records.length > 0) {
          const errorList = batchResult.failed_records.map(f => 
            `• ${f.employee_name}: ${f.reason}`
          ).join('\n');
          
          Swal.fire({
            title: 'Processing Failed',
            html: `<pre class="text-left text-sm text-red-600">${errorList}</pre>`,
            icon: 'error'
          });
        }
      }
    } catch (error) {
      console.error("Error processing records:", error);
      toast.error(error.response?.data?.message || "Failed to process records. Please try again.");
    } finally {
      setSaving(false);
      setBatchProgress({ show: false, current: 0, total: 0 });
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
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
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.from_fy_id) {
      newErrors.from_fy_id = "From Financial Year is required";
    }
    
    if (!formData.to_fy_id) {
      newErrors.to_fy_id = "To Financial Year is required";
    }
    
    if (formData.from_fy_id && formData.to_fy_id && formData.from_fy_id == formData.to_fy_id) {
      newErrors.to_fy_id = "To Financial Year must be different from From Financial Year";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }
    
    if (selectedEligibilityIds.length > 0) {
      await handleProcessSelected();
    } else if (hasGenerated && eligibilityData && eligibilityData.total_eligible > 0) {
      toast.error("Please select at least one record to process");
    } else {
      toast.error("Please click Generate button first to check eligibility");
    }
  };
  
  const handleCancel = () => {
    navigate("/transactions/attendance-management/leave/leave-carryforward-entry");
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
      {/* Batch Progress Indicator */}
      {batchProgress.show && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 min-w-[300px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Processing...</span>
            <span className="text-sm text-gray-500">{batchProgress.current} / {batchProgress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
            ></div>
          </div>
          {batchProgress.currentCombo && (
            <p className="text-xs text-gray-500 mt-2 truncate">
              Processing: {batchProgress.currentCombo.employee_name} - {batchProgress.currentCombo.leave_type}
            </p>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/transactions/attendance-management/leave/leave-carryforward-entry")}
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
                ? "View carry forward record details"
                : "Process leave carry forward from one financial year to another"}
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Form Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Carry Forward Details
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From Financial Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Financial Year *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  ref={fromFyRef}
                  name="from_fy_id"
                  value={formData.from_fy_id}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.from_fy_id ? "border-red-300" : "border-gray-300"
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
                {errors.from_fy_id && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.from_fy_id && (
                <p className="mt-1 text-sm text-red-600">{errors.from_fy_id}</p>
              )}
            </div>
            
            {/* To Financial Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Financial Year *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  ref={toFyRef}
                  name="to_fy_id"
                  value={formData.to_fy_id}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.to_fy_id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isEditMode}
                >
                  <option value="">Select Financial Year</option>
                  {financialYears
                    .filter(fy => fy.FY_Id != formData.from_fy_id)
                    .map(fy => (
                      <option key={fy.FY_Id} value={fy.FY_Id}>
                        {fy.FY_Name} ({new Date(fy.St_Date).toLocaleDateString()} - {new Date(fy.Ed_Date).toLocaleDateString()})
                      </option>
                    ))}
                </select>
                {errors.to_fy_id && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.to_fy_id && (
                <p className="mt-1 text-sm text-red-600">{errors.to_fy_id}</p>
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
                            {item.First_Name || item.Last_Name || ""}
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
            
            {/* Leave Type Dropdown */}
            <div className="relative" ref={leaveTypeDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type 
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                {loadingDropdowns ? (
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
              
              {isLeaveTypeDropdownOpen && !loadingDropdowns && (
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
          </div>
          
          {/* Auto Carry Checkbox and Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="auto_carry"
                checked={formData.auto_carry}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                disabled={isEditMode}
              />
              <span className="text-sm text-gray-700">
                Auto Carry (Automatically determine carry forward based on rules)
              </span>
            </label>
            
            {!isEditMode && (
              <div className="flex items-center gap-3">            
                <button
                  ref={generateButtonRef}
                  type="button"
                  onClick={handleGenerate}
                  disabled={!formData.from_fy_id || !formData.to_fy_id || loadingEligibility}
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
                  onClick={handleClearCarryForwardFilters}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center transition-all border border-gray-300"
                  title="Clear employee and leave type filters"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Clear Filters
                </button>
              </div>
            )}
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
                  Eligibility Check Results
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                Total: {eligibilityData.total_eligible} | Selected: {selectedEligibilityIds.length}
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
                
                {/* Results Table */}
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
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Max Carry Forward</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Eligible Days</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Will Lapse</th>
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
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.leave_type || `Leave Type #${item.lt_id}`}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium">
                              {item.remaining_days} days
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              {item.max_carry_forward_allowed} days
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                              {item.eligible_days} days
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-red-600">
                              {item.will_lapse} days
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
                <p className="text-gray-600">No eligible employees found for carry forward</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try selecting different financial years or check if there are leave balances
                </p>
              </div>
            )}
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
                Process Results
              </h2>
            </div>
            
            {processResult.message && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
                {processResult.message}
              </div>
            )}
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Carried Forward</span>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600 mt-2">
                  {processResult.total_carried_forward_days || 0} days
                </div>
                <div className="text-xs text-green-700 mt-1">
                  {processResult.carried_forward?.length || 0} records
                </div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">Lapsed</span>
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600 mt-2">
                  {processResult.total_lapsed_days || 0} days
                </div>
                <div className="text-xs text-red-700 mt-1">
                  {processResult.lapsed?.length || 0} records
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Processing Status</span>
                  <Check className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  {processResult.total_success || 0} / {(processResult.total_success || 0) + (processResult.total_failed || 0)}
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {processResult.total_failed > 0 ? `${processResult.total_failed} failed` : "All successful"}
                </div>
              </div>
            </div>
            
            {/* Failed Records Section - NEW */}
            {processResult.failed_records && processResult.failed_records.length > 0 && (
              <div className="mt-4 mb-6">
                <h3 className="text-sm font-semibold text-red-800 mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  Failed Records ({processResult.failed_records.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-red-700">Employee</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-red-700">Leave Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-red-700">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processResult.failed_records.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="px-4 py-2 text-sm">{item.employee_name}</td>
                          <td className="px-4 py-2 text-sm">{item.leave_type}</td>
                          <td className="px-4 py-2 text-sm text-red-600">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Balance Verifications Section - STEP 3 FROM FLOW DIAGRAM */}
            {processResult.balance_verifications && processResult.balance_verifications.length > 0 && (
              <div className="mt-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  Verified Balances (New Financial Year) ✅
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Employee</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Leave Type</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">New Balance</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processResult.balance_verifications.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="px-4 py-2 text-sm">{item.employee_name}</td>
                          <td className="px-4 py-2 text-sm">{item.leave_type}</td>
                          <td className="px-4 py-2 text-sm text-right font-bold text-green-600">
                            {item.new_balance} days
                          </td>
                          <td className="px-4 py-2 text-sm text-center">
                            {item.verified ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check className="h-3 w-3 mr-1" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Failed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Carried Forward Details */}
            {processResult.carried_forward && processResult.carried_forward.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                  Carried Forward Details
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Employee</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Leave Type</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Carried Days</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processResult.carried_forward.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="px-4 py-2 text-sm">{item.employee_name || `Emp #${item.emp_id}`}</td>
                          <td className="px-4 py-2 text-sm">{item.leave_type || `LT #${item.lt_id}`}</td>
                          <td className="px-4 py-2 text-sm text-right text-green-600 font-medium">
                            {item.carry_forward_days || item.carried_days} days
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {item.carry_forward_transaction_id || item.transaction_id || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Lapsed Details */}
            {processResult.lapsed && processResult.lapsed.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                  Lapsed Details
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Employee</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Leave Type</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Lapsed Days</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processResult.lapsed.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="px-4 py-2 text-sm">{item.employee_name || `Emp #${item.emp_id}`}</td>
                          <td className="px-4 py-2 text-sm">{item.leave_type || `LT #${item.lt_id}`}</td>
                          <td className="px-4 py-2 text-sm text-right text-red-600 font-medium">
                            {item.lapsed_days} days
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.reason || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
              type="submit"
              disabled={!canProcess()}
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
                  Process Selected ({selectedEligibilityIds.length})
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditLeaveCarryForward;