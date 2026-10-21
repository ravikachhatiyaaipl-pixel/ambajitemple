  // leave-application-entry/addedit.jsx
  import { useState, useEffect, useRef } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import {
    Save,
    X,
    ArrowLeft,
    FileText,
    Calendar,
    Layers,
    AlertCircle,
    ChevronDown,
    Search,
    ChevronUp,
    Check,
    User,
    Phone,
    Mail,
    MapPin,
    FileDigit,
    Clock,
    Building,
    Briefcase,
    Eye,
    DollarSign,
    Tag,
    Receipt,
    XCircle,
    ChevronRight,
    Shield,
    ShieldOff,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Wallet,
    BookOpen,
    PieChart,
    Coins,
    CreditCard,
  } from "lucide-react";
  import { toast } from "react-hot-toast";
  import Swal from "sweetalert2";
  import { LeaveApplicationApi } from "../../../../services/leaveapplicationapi";
  import axios from "axios";

  const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

  const AddEditLeaveApplication = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadingDropdowns, setLoadingDropdowns] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [errors, setErrors] = useState({});
    const [pageTitle, setPageTitle] = useState("Leave Application Entry");
    const [currentStage, setCurrentStage] = useState(null);
    const [initialActionId, setInitialActionId] = useState(null);
    const [userDeptId, setUserDeptId] = useState(null);
    const [userDesignationId, setUserDesignationId] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [hasCreatePermission, setHasCreatePermission] = useState(false);
    const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
    const [showEmployeePreview, setShowEmployeePreview] = useState(false);
    const [selectedLeaveTypeDetails, setSelectedLeaveTypeDetails] =
      useState(null);
    const [showLeaveTypePreview, setShowLeaveTypePreview] = useState(false);
    const [leaveSummary, setLeaveSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [financialYears, setFinancialYears] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [loadingHolidays, setLoadingHolidays] = useState(false);
    const isInitialLoadRef = useRef(true);

    // Paid/Unpaid leave calculation
    const [paidDays, setPaidDays] = useState(0);
    const [unpaidDays, setUnpaidDays] = useState(0);

    // Dropdown data states
    const [employeeData, setEmployeeData] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
    const [employeeHighlightedIndex, setEmployeeHighlightedIndex] = useState(-1);
    const employeeDropdownRef = useRef(null);
    const employeeSearchRef = useRef(null);
    const employeeItemRefs = useRef([]);
    const employeeListRef = useRef(null);

    const [leaveTypeData, setLeaveTypeData] = useState([]);
    const [filteredLeaveTypes, setFilteredLeaveTypes] = useState([]);
    const [leaveTypeSearchTerm, setLeaveTypeSearchTerm] = useState("");
    const [isLeaveTypeDropdownOpen, setIsLeaveTypeDropdownOpen] = useState(false);
    const [leaveTypeHighlightedIndex, setLeaveTypeHighlightedIndex] =
      useState(-1);
    const leaveTypeDropdownRef = useRef(null);
    const leaveTypeSearchRef = useRef(null);
    const leaveTypeItemRefs = useRef([]);
    const leaveTypeListRef = useRef(null);

    // Half-day options
    const halfDayOptions = [
      { value: "FD", label: "Full Day", icon: Clock },
      { value: "FH", label: "First Half", icon: Clock },
      { value: "SH", label: "Second Half", icon: Clock },
    ];

    // Form data state
    const [formData, setFormData] = useState({
      Emp_Id: "",
      LT_id: "",
      LA_Code: "",
      Fr_Date: new Date().toISOString().split("T")[0],
      FDt_hfDy: "FD",
      To_Date: new Date().toISOString().split("T")[0],
      TDt_hfDy: "FD",   
      Tot_Days: "",
      Prx_HlDy: false,
      Sfx_HlDy: false,
      Reason: "",
      Lv_Cnt: "",
      Lv_Adr: "",
      Paid: 0,
      UnPaid: 0,
    });

    // Refs for focus management
    const employeeButtonRef = useRef(null);
    const leaveTypeButtonRef = useRef(null);
    const fromDateRef = useRef(null);
    const toDateRef = useRef(null);
    const reasonRef = useRef(null);
    const contactRef = useRef(null);
    const addressRef = useRef(null);
    const cancelButtonRef = useRef(null);
    const saveButtonRef = useRef(null);

    // Load holidays on mount
    useEffect(() => {
      loadHolidays();
    }, []);

    const loadHolidays = async () => {
      setLoadingHolidays(true);
      try {
        const response = await LeaveApplicationApi.getAllHolidays();
        if (response.success && response.data) {
          setHolidays(response.data);
        }
      } catch (error) {
        console.error("Error loading holidays:", error);
      } finally {
        setLoadingHolidays(false);
      }
    };

    // Check for previous/subsequent CONSECUTIVE holidays when dates change
    useEffect(() => {
      if (isInitialLoadRef.current) return;

      if (formData.Fr_Date && holidays.length > 0) {
        const selectedDate = new Date(formData.Fr_Date);
        const hasPrevHoliday = LeaveApplicationApi.hasPreviousConsecutiveHoliday(
          selectedDate,
          holidays,
        );
        const hasNextHoliday =
          LeaveApplicationApi.hasSubsequentConsecutiveHoliday(
            selectedDate,
            holidays,
          );

        setFormData((prev) => ({
          ...prev,
          Prx_HlDy: hasPrevHoliday,
          Sfx_HlDy: hasNextHoliday,
        }));
      }
    }, [formData.Fr_Date, holidays]);

    // Calculate Paid and Unpaid days based on leave balance
    // Calculate Paid and Unpaid days based on leave balance
    const calculatePaidUnpaidDays = (requestedDays, availableBalance) => {
      if (requestedDays <= 0) {
        setPaidDays(0);
        setUnpaidDays(0);
        setFormData((prev) => ({ ...prev, Paid: 0, UnPaid: 0 }));
        return;
      }

      const requested = parseFloat(requestedDays);
      const available = parseFloat(availableBalance);

      let paid = 0;
      let unpaid = 0;

      // If available balance is negative or zero, all days should be unpaid
      if (available <= 0) {
        paid = 0;
        unpaid = requested;
      }
      // If requested days are less than or equal to available balance, all paid
      else if (requested <= available) {
        paid = requested;
        unpaid = 0;
      }
      // If requested days exceed available balance, partial paid, rest unpaid
      else {
        paid = available;
        unpaid = requested - available;
      }

      // Ensure paid is never negative
      paid = Math.max(0, paid);
      unpaid = Math.max(0, unpaid);

      setPaidDays(paid);
      setUnpaidDays(unpaid);
      setFormData((prev) => ({
        ...prev,
        Paid: paid,
        UnPaid: unpaid,
      }));
    };

    // Load financial years
    const loadFinancialYears = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/fy-master`,{
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        });
        if (response.data.success) {
          setFinancialYears(response.data.data);
        }
      } catch (error) {
        console.error("Error loading financial years:", error);
      }
    };

    // Get financial year based on date
    const getFinancialYear = (date) => {
      if (!date || !financialYears.length) return null;

      const dateObj = new Date(date);

      for (const fy of financialYears) {
        const startDate = new Date(fy.St_Date);
        const endDate = new Date(fy.Ed_Date);
        if (dateObj >= startDate && dateObj <= endDate) {
          return fy;
        }
      }
      return null;
    };

    // Fetch leave summary
    // Fetch leave summary
    const fetchLeaveSummary = async (empId, ltId, fromDate) => {
      if (!empId || !ltId || !fromDate) return;

      setLoadingSummary(true);
      try {
        const selectedFY = getFinancialYear(fromDate);

        if (!selectedFY) {
          console.log("No financial year found for date:", fromDate);
          setLeaveSummary(null);
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/leave-trans/employee-summary`,
          {
            params: {
              emp_id: empId,
              fy_id: selectedFY.FY_Id,
              lt_id: ltId,
            },
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        
          },
        );

        if (response.data.success && response.data.data) {
          setLeaveSummary(response.data.data);

          // Ensure overall_summary exists with proper values
          const summary = response.data.data.overall_summary || {};
          const credited = summary.total_credited_days || 0;
          const debited = summary.total_debited_days || 0;
          const netBalance = credited - debited; // Calculate net balance manually if not provided

          const availableBalance =
            summary.net_balance != undefined ? summary.net_balance : netBalance;
          const requestedDays = parseFloat(formData.Tot_Days) || 0;
          calculatePaidUnpaidDays(requestedDays, availableBalance);
        } else {
          setLeaveSummary(null);
          // Reset paid/unpaid if no summary available
          calculatePaidUnpaidDays(parseFloat(formData.Tot_Days) || 0, 0);
        }
      } catch (error) {
        console.error("Error fetching leave summary:", error);
        setLeaveSummary(null);
        // Reset paid/unpaid on error
        calculatePaidUnpaidDays(parseFloat(formData.Tot_Days) || 0, 0);
      } finally {
        setLoadingSummary(false);
      }
    };

    useEffect(() => {
      const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
      setIsAdmin(adminCheck);

      const deptId =
        user?.departmentData?.Dpt_id ||
        user?.apiUserData?.employee?.department?.Dpt_id;
      setUserDeptId(deptId ? parseInt(deptId) : null);

      const desigId =
        user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
      setUserDesignationId(desigId ? parseInt(desigId) : null);

      loadFinancialYears();
      loadMenuAndStage();
      loadDropdownData();

      if (id && id != "create") {
        setIsEditMode(true);
        loadEntryData();
      }

      const handleClickOutside = (event) => {
        if (
          employeeDropdownRef.current &&
          !employeeDropdownRef.current.contains(event.target)
        ) {
          setIsEmployeeDropdownOpen(false);
          setEmployeeHighlightedIndex(-1);
          setEmployeeSearchTerm("");
        }
        if (
          leaveTypeDropdownRef.current &&
          !leaveTypeDropdownRef.current.contains(event.target)
        ) {
          setIsLeaveTypeDropdownOpen(false);
          setLeaveTypeHighlightedIndex(-1);
          setLeaveTypeSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [id, user]);

    const loadMenuAndStage = async () => {
      try {
        const menuDetails = JSON.parse(
          localStorage.getItem("menu_details") || "[]",
        );
        const currentPath =
          "/transactions/attendance-management/leave/leave-application-entry";
        const currentMenuItem = menuDetails.find(
          (item) => item.Menu_Links == currentPath,
        );

        if (currentMenuItem) {
          setPageTitle(currentMenuItem.Fnc_Title || currentMenuItem.Fnc_Desc);

          if (currentMenuItem.action && currentMenuItem.action.stage) {
            const stage = currentMenuItem.action.stage;
            setCurrentStage(stage);
            await loadActionsForStage(stage);
          }
        }
      } catch (error) {
        console.error("Error parsing menu details:", error);
      }
    };

    const loadActionsForStage = async (stage) => {
      if (!stage) return;

      try {
        const response = await LeaveApplicationApi.getAllByStage(stage);

        if (response.status && response.data) {
          const actions = response.data;

          const initialAction = actions.find((action) => !action.Previous_Status);
          if (initialAction) {
            setInitialActionId(initialAction.Act_Id);
          }

          if (!isAdmin && userDesignationId && userDeptId) {
            const hasPermission = actions.some((action) => {
              const deptMatch = parseInt(action.Dpt_id) == userDeptId;
              const isAuthority = action.authorities_details?.some(
                (auth) => parseInt(auth.Dsg_id) == userDesignationId,
              );
              return deptMatch && isAuthority && !action.Previous_Status;
            });

            setHasCreatePermission(hasPermission);

            if (!hasPermission && !isEditMode) {
              toast.error(
                "You don't have permission to create new leave applications",
              );
              navigate(
                "/transactions/attendance-management/leave/leave-application-entry",
              );
            }
          } else if (isAdmin) {
            setHasCreatePermission(true);
          }
        }
      } catch (error) {
        console.error("Error loading actions for stage:", error);
      }
    };

    useEffect(() => {
      if (
        formData.Emp_Id &&
        formData.LT_id &&
        formData.Fr_Date &&
        financialYears.length > 0
      ) {
        fetchLeaveSummary(
          parseInt(formData.Emp_Id),
          parseInt(formData.LT_id),
          formData.Fr_Date,
        );
      } else {
        setLeaveSummary(null);
      }
    }, [formData.Emp_Id, formData.LT_id, formData.Fr_Date, financialYears]);

    useEffect(() => {
      if (leaveSummary && formData.Tot_Days) {
        const availableBalance = leaveSummary.overall_summary?.net_balance || 0;
        calculatePaidUnpaidDays(parseFloat(formData.Tot_Days), availableBalance);
      }
    }, [formData.Tot_Days, leaveSummary]);

    useEffect(() => {
      if (!loading && !isEditMode) {
        setTimeout(() => employeeButtonRef.current?.focus(), 100);
      }
    }, [loading, isEditMode]);

    useEffect(() => {
      if (isEmployeeDropdownOpen && employeeSearchRef.current) {
        setTimeout(() => employeeSearchRef.current.focus(), 0);
      }
    }, [isEmployeeDropdownOpen]);

    useEffect(() => {
      if (isLeaveTypeDropdownOpen && leaveTypeSearchRef.current) {
        setTimeout(() => leaveTypeSearchRef.current.focus(), 0);
      }
    }, [isLeaveTypeDropdownOpen]);

    useEffect(() => {
      if (
        isEmployeeDropdownOpen &&
        employeeHighlightedIndex >= 0 &&
        employeeListRef.current
      ) {
        const container = employeeListRef.current;
        const item = employeeItemRefs.current[employeeHighlightedIndex];
        if (item) {
          const containerRect = container.getBoundingClientRect();
          const itemRect = item.getBoundingClientRect();

          if (itemRect.bottom > containerRect.bottom) {
            item.scrollIntoView({ block: "nearest", behavior: "smooth" });
          } else if (itemRect.top < containerRect.top) {
            item.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        }
      }
    }, [employeeHighlightedIndex, isEmployeeDropdownOpen]);

    useEffect(() => {
      if (
        isLeaveTypeDropdownOpen &&
        leaveTypeHighlightedIndex >= 0 &&
        leaveTypeListRef.current
      ) {
        const container = leaveTypeListRef.current;
        const item = leaveTypeItemRefs.current[leaveTypeHighlightedIndex];
        if (item) {
          const containerRect = container.getBoundingClientRect();
          const itemRect = item.getBoundingClientRect();

          if (itemRect.bottom > containerRect.bottom) {
            item.scrollIntoView({ block: "nearest", behavior: "smooth" });
          } else if (itemRect.top < containerRect.top) {
            item.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        }
      }
    }, [leaveTypeHighlightedIndex, isLeaveTypeDropdownOpen]);

    const calculateTotalDays = () => {
      if (formData.Fr_Date && formData.To_Date) {
        const fromDate = new Date(formData.Fr_Date);
        const toDate = new Date(formData.To_Date);

        if (toDate >= fromDate) {
          const diffTime = Math.abs(toDate - fromDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          let totalDays = diffDays;

          const fromHalfDay = formData.FDt_hfDy;
          const toHalfDay = formData.TDt_hfDy;

          const fromIsHalf = fromHalfDay == "FH" || fromHalfDay == "SH";
          const toIsHalf = toHalfDay == "FH" || toHalfDay == "SH";

          if (diffDays == 1) {
            if (fromIsHalf && toIsHalf) {
              totalDays = 0.5;
            } else if (fromIsHalf || toIsHalf) {
              totalDays = 0.5;
            } else {
              totalDays = 1;
            }
          } else {
            let reduction = 0;

            if (fromIsHalf) {
              reduction += 0.5;
            }

            if (toIsHalf) {
              reduction += 0.5;
            }

            totalDays = diffDays - reduction;

            if (totalDays < 0.5 && totalDays > 0) {
              totalDays = 0.5;
            }
          }

          setFormData((prev) => ({
            ...prev,
            Tot_Days: totalDays.toFixed(2),
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            Tot_Days: "",
          }));
        }
      }
    };

    useEffect(() => {
      calculateTotalDays();
    }, [
      formData.Fr_Date,
      formData.To_Date,
      formData.FDt_hfDy,
      formData.TDt_hfDy,
    ]);

    useEffect(() => {
      if (formData.Emp_Id) {
        const selected = employeeData.find(
          (emp) => emp.Emp_Id == parseInt(formData.Emp_Id),
        );
        setSelectedEmployeeDetails(selected || null);
        setShowEmployeePreview(!!selected);
      } else {
        setSelectedEmployeeDetails(null);
        setShowEmployeePreview(false);
      }
    }, [formData.Emp_Id, employeeData]);

    useEffect(() => {
      if (formData.LT_id) {
        const selected = leaveTypeData.find(
          (type) => type.LT_id == parseInt(formData.LT_id),
        );
        setSelectedLeaveTypeDetails(selected || null);
        setShowLeaveTypePreview(!!selected);
      } else {
        setSelectedLeaveTypeDetails(null);
        setShowLeaveTypePreview(false);
      }
    }, [formData.LT_id, leaveTypeData]);

    const loadDropdownData = async () => {
      setLoadingDropdowns(true);
      try {
        const [employeeResponse, leaveTypeResponse] = await Promise.all([
          LeaveApplicationApi.getAllEmployees(),
          LeaveApplicationApi.getAllLeaveTypes(),
        ]);

        if (employeeResponse.status && employeeResponse.data) {
          setEmployeeData(employeeResponse.data);
          setFilteredEmployees(employeeResponse.data);
        }

        if (leaveTypeResponse.success && leaveTypeResponse.data) {
          setLeaveTypeData(leaveTypeResponse.data);
          setFilteredLeaveTypes(leaveTypeResponse.data);
        }
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Failed to load dropdown data");
      } finally {
        setLoadingDropdowns(false);
      }
    };

    const loadEntryData = async () => {
      setLoading(true);
      try {
        const response = await LeaveApplicationApi.getById(id);
        const entry = response?.data || response;

        setFormData({
          Emp_Id: entry?.Emp_Id?.toString() || "",
          LT_id: entry?.LT_id?.toString() || "",
          LA_Code: entry?.LA_Code || "",
          Fr_Date: entry?.Fr_Date || new Date().toISOString().split("T")[0],
          FDt_hfDy: entry?.FDt_hfDy || "FD",
          To_Date: entry?.To_Date || new Date().toISOString().split("T")[0],
          TDt_hfDy: entry?.TDt_hfDy || "FD",
          Tot_Days: entry?.Tot_Days?.toString() || "",
          Prx_HlDy: entry?.Prx_HlDy == "1" || entry?.Prx_HlDy == true,
          Sfx_HlDy: entry?.Sfx_HlDy == "1" || entry?.Sfx_HlDy == true,
          Reason: entry?.Reason || "",
          Lv_Cnt: entry?.Lv_Cnt || "",
          Lv_Adr: entry?.Lv_Adr || "",
          Paid: entry?.Paid || 0,
          UnPaid: entry?.UnPaid || 0,
        });

        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 100);

        setTimeout(() => employeeButtonRef.current?.focus(), 100);
      } catch (error) {
        console.error("Error loading entry:", error);
        toast.error("Failed to load entry data!");
        navigate(
          "/transactions/attendance-management/leave/leave-application-entry",
        );
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (!isEditMode && !loading) {
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 500);
      }
    }, [isEditMode, loading]);

    useEffect(() => {
      if (!employeeSearchTerm.trim()) {
        setFilteredEmployees(employeeData);
      } else {
        const term = employeeSearchTerm.toLowerCase();
        const filtered = employeeData.filter(
          (item) =>
            item.First_Name?.toLowerCase().includes(term) ||
            item.Last_Name?.toLowerCase().includes(term) ||
            item.Emp_Code?.toLowerCase().includes(term) ||
            item.Phone?.includes(term) ||
            item.Email_Id?.toLowerCase().includes(term),
        );
        setFilteredEmployees(filtered);
      }
      setEmployeeHighlightedIndex(-1);
    }, [employeeSearchTerm, employeeData]);

    useEffect(() => {
      if (!leaveTypeSearchTerm.trim()) {
        setFilteredLeaveTypes(leaveTypeData);
      } else {
        const term = leaveTypeSearchTerm.toLowerCase();
        const filtered = leaveTypeData.filter((type) =>
          type.LT_name?.toLowerCase().includes(term),
        );
        setFilteredLeaveTypes(filtered);
      }
      setLeaveTypeHighlightedIndex(-1);
    }, [leaveTypeSearchTerm, leaveTypeData]);

    const handleEmployeeKeyDown = (e) => {
      if (
        e.key == "ArrowDown" ||
        e.key == "ArrowUp" ||
        e.key == "Enter" ||
        e.key == " "
      ) {
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
          setTimeout(() => {
            if (employeeItemRefs.current[0]) {
              employeeItemRefs.current[0].focus();
            }
          }, 0);
        }
      } else if (e.key == "ArrowUp") {
        e.preventDefault();
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
          setTimeout(() => {
            if (employeeItemRefs.current[nextIndex]) {
              employeeItemRefs.current[nextIndex].focus();
            }
          }, 0);
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
          setTimeout(() => {
            if (employeeItemRefs.current[prevIndex]) {
              employeeItemRefs.current[prevIndex].focus();
            }
          }, 0);
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
        Emp_Id: item.Emp_Id.toString(),
      }));
      setIsEmployeeDropdownOpen(false);
      setEmployeeSearchTerm("");
      setEmployeeHighlightedIndex(-1);

      if (errors.Emp_Id) {
        setErrors((prev) => ({ ...prev, Emp_Id: "" }));
      }

      setTimeout(() => leaveTypeButtonRef.current?.focus(), 100);
    };

    const getSelectedEmployeeName = () => {
      if (!formData.Emp_Id) return "";
      const selected = employeeData.find(
        (item) => item.Emp_Id == parseInt(formData.Emp_Id),
      );
      return selected
        ? `${selected.First_Name} ${selected.Last_Name || ""}`.trim()
        : "";
    };

    const handleLeaveTypeKeyDown = (e) => {
      if (
        e.key == "ArrowDown" ||
        e.key == "ArrowUp" ||
        e.key == "Enter" ||
        e.key == " "
      ) {
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
          setTimeout(() => {
            if (leaveTypeItemRefs.current[0]) {
              leaveTypeItemRefs.current[0].focus();
            }
          }, 0);
        }
      } else if (e.key == "ArrowUp") {
        e.preventDefault();
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
          setTimeout(() => {
            if (leaveTypeItemRefs.current[nextIndex]) {
              leaveTypeItemRefs.current[nextIndex].focus();
            }
          }, 0);
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
          setTimeout(() => {
            if (leaveTypeItemRefs.current[prevIndex]) {
              leaveTypeItemRefs.current[prevIndex].focus();
            }
          }, 0);
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
        LT_id: item.LT_id.toString(),
      }));
      setIsLeaveTypeDropdownOpen(false);
      setLeaveTypeSearchTerm("");
      setLeaveTypeHighlightedIndex(-1);

      if (errors.LT_id) {
        setErrors((prev) => ({ ...prev, LT_id: "" }));
      }

      setTimeout(() => fromDateRef.current?.focus(), 100);
    };

    const getSelectedLeaveTypeName = () => {
      if (!formData.LT_id) return "";
      const selected = leaveTypeData.find(
        (item) => item.LT_id == parseInt(formData.LT_id),
      );
      return selected ? selected.LT_name : "";
    };

    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;

      if (type == "checkbox") {
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    };

    const handleHalfDayChange = (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleEnterKey = (e, nextRef) => {
      if (e.key == "Enter") {
        e.preventDefault();
        if (nextRef?.current) {
          nextRef.current.focus();
        }
      }
    };

    const validateForm = () => {
      const newErrors = {};

      if (!formData.Emp_Id) {
        newErrors.Emp_Id = "Employee selection is required";
      }

      if (!formData.LT_id) {
        newErrors.LT_id = "Leave type selection is required";
      }

      if (!formData.Fr_Date) {
        newErrors.Fr_Date = "From date is required";
      }

      if (!formData.To_Date) {
        newErrors.To_Date = "To date is required";
      }

      if (formData.Fr_Date && formData.To_Date) {
        if (new Date(formData.To_Date) < new Date(formData.Fr_Date)) {
          newErrors.To_Date = "To date must be after or equal to from date";
        }
      }

      if (!formData.Tot_Days || parseFloat(formData.Tot_Days) <= 0) {
        newErrors.Tot_Days = "Total days must be greater than 0";
      }

      if (!formData.Reason) {
        newErrors.Reason = "Reason is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length == 0;
    };

    const preparePayload = () => {
      const payload = {
        Emp_Id: parseInt(formData.Emp_Id),
        LT_id: parseInt(formData.LT_id),
        LA_Code: formData.LA_Code,
        Fr_Date: formData.Fr_Date,
        FDt_hfDy: formData.FDt_hfDy,
        To_Date: formData.To_Date,
        TDt_hfDy: formData.TDt_hfDy,
        Tot_Days: parseFloat(formData.Tot_Days),
        Prx_HlDy: formData.Prx_HlDy ? 1 : 0,
        Sfx_HlDy: formData.Sfx_HlDy ? 1 : 0,
        Reason: formData.Reason,
        Lv_Cnt: formData.Lv_Cnt,
        Lv_Adr: formData.Lv_Adr,
        Paid: parseFloat(paidDays.toFixed(2)),
        UnPaid: parseFloat(unpaidDays.toFixed(2)),
      };

      if (!isEditMode && initialActionId) {
        payload.Status = initialActionId;
      }

      return payload;
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

      const result = await Swal.fire({
        title: isEditMode
          ? "Update Leave Application?"
          : "Create New Leave Application?",
        text: isEditMode
          ? "Are you sure you want to update this leave application?"
          : "Are you sure you want to create this new leave application?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: isEditMode ? "Yes, update!" : "Yes, create!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      setSaving(true);
      try {
        const payload = preparePayload();

        if (isEditMode) {
          await LeaveApplicationApi.update(id, payload);
          toast.success("Leave application updated successfully!");
        } else {
          await LeaveApplicationApi.create(payload);
          toast.success("Leave application created successfully!");
        }

        setTimeout(() => {
          navigate(
            "/transactions/attendance-management/leave/leave-application-entry",
          );
        }, 1500);
      } catch (error) {
        console.error("Error saving entry:", error);

        if (error.response?.data?.errors) {
          const backendErrors = error.response.data.errors;
          const newErrors = {};

          Object.keys(backendErrors).forEach((key) => {
            newErrors[key] = backendErrors[key][0];
          });

          setErrors(newErrors);
          toast.error("Please fix the validation errors");
        } else {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              (isEditMode
                ? "Failed to update leave application. Please try again."
                : "Failed to create leave application. Please try again."),
          );
        }
      } finally {
        setSaving(false);
      }
    };

    const handleCancel = () => {
      navigate(
        "/transactions/attendance-management/leave/leave-application-entry",
      );
    };

    if (loading && !isEditMode) {
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
              onClick={() =>
                navigate(
                  "/transactions/attendance-management/leave/leave-application-entry",
                )
              }
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
                  ? "Update leave application information"
                  : "Create new leave application"}
              </p>
              {!isAdmin && (
                <p className="text-xs text-gray-400 mt-1">
                  Dept ID: {userDeptId} | Desg ID: {userDesignationId} | Stage:{" "}
                  {currentStage}
                </p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Leave Application Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Dropdown */}
              <div className="relative" ref={employeeDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *
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
                        onClick={() =>
                          setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)
                        }
                        onKeyDown={handleEmployeeKeyDown}
                        className={`w-full pl-10 pr-10 py-2.5 border ${
                          errors.Emp_Id ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white truncate`}
                      >
                        {formData.Emp_Id ? (
                          <span className="text-gray-900">
                            {getSelectedEmployeeName()}
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            Select an employee
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)
                        }
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
                  {errors.Emp_Id && (
                    <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.Emp_Id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Emp_Id}
                  </p>
                )}

                {isEmployeeDropdownOpen && !loadingDropdowns && (
                  <div
                    className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden"
                    style={{ width: "100%", minWidth: "280px" }}
                  >
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={employeeSearchRef}
                          type="text"
                          value={employeeSearchTerm}
                          onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                          onKeyDown={handleEmployeeSearchKeyDown}
                          placeholder="Search by name, code, phone or email..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        {employeeSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setEmployeeSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      ref={employeeListRef}
                      className="overflow-y-auto max-h-64"
                    >
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((item, idx) => (
                          <button
                            key={item.Emp_Id}
                            ref={(el) => {
                              employeeItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleEmployeeSelect(item)}
                            onKeyDown={(e) =>
                              handleEmployeeItemKeyDown(e, item, idx)
                            }
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                              employeeHighlightedIndex == idx
                                ? "bg-blue-100"
                                : formData.Emp_Id == item.Emp_Id.toString()
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                            }`}
                            tabIndex={0}
                          >
                            <div className="font-medium text-gray-900 truncate">
                              {item.First_Name} {item.Last_Name || ""}
                            </div>

                            {formData.Emp_Id == item.Emp_Id.toString() && (
                              <div className="text-xs text-blue-600 mt-1 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Selected
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                          <p>No employees found</p>
                          <p className="text-xs mt-1">
                            Try a different search term
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{filteredEmployees.length} employees found</span>
                        <span>Total: {employeeData.length} employees</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Leave Type Dropdown */}
              <div className="relative" ref={leaveTypeDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type *
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  {loadingDropdowns ? (
                    <div className="flex items-center pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-gray-500">
                        Loading leave types...
                      </span>
                    </div>
                  ) : (
                    <>
                      <button
                        ref={leaveTypeButtonRef}
                        type="button"
                        onClick={() =>
                          setIsLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen)
                        }
                        onKeyDown={handleLeaveTypeKeyDown}
                        className={`w-full pl-10 pr-10 py-2.5 border ${
                          errors.LT_id ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white truncate`}
                      >
                        {formData.LT_id ? (
                          <span className="text-gray-900">
                            {getSelectedLeaveTypeName()}
                          </span>
                        ) : (
                          <span className="text-gray-500">Select leave type</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setIsLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen)
                        }
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
                  {errors.LT_id && (
                    <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.LT_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.LT_id}
                  </p>
                )}

                {isLeaveTypeDropdownOpen && !loadingDropdowns && (
                  <div
                    className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden"
                    style={{ width: "100%", minWidth: "250px" }}
                  >
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={leaveTypeSearchRef}
                          type="text"
                          value={leaveTypeSearchTerm}
                          onChange={(e) => setLeaveTypeSearchTerm(e.target.value)}
                          onKeyDown={handleLeaveTypeSearchKeyDown}
                          placeholder="Search by name or code..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        {leaveTypeSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setLeaveTypeSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      ref={leaveTypeListRef}
                      className="overflow-y-auto max-h-64"
                    >
                      {filteredLeaveTypes.length > 0 ? (
                        filteredLeaveTypes.map((item, idx) => (
                          <button
                            key={item.LT_id}
                            ref={(el) => {
                              leaveTypeItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleLeaveTypeSelect(item)}
                            onKeyDown={(e) =>
                              handleLeaveTypeItemKeyDown(e, item, idx)
                            }
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                              leaveTypeHighlightedIndex == idx
                                ? "bg-blue-100"
                                : formData.LT_id == item.LT_id.toString()
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                            }`}
                            tabIndex={0}
                          >
                            <div className="font-medium text-gray-900 truncate">
                              {item.LT_name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                              <span>Max Days: {item.Max_days}</span>
                              {item.Is_Paid && (
                                <span className="text-green-600">Paid Leave</span>
                              )}
                            </div>
                            {formData.LT_id == item.LT_id.toString() && (
                              <div className="text-xs text-blue-600 mt-1 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Selected
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                          <p>No leave types found</p>
                          <p className="text-xs mt-1">
                            Try a different search term
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{filteredLeaveTypes.length} leave types found</span>
                        <span>Total: {leaveTypeData.length} leave types</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Leave Balance Summary */}
            {/* Leave Balance Summary */}
            {leaveSummary && (
              <div className="mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
                  <div className="flex items-center mb-3">
                    <Wallet className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-sm font-semibold text-gray-900">
                      Leave Balance Summary
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Total Credited
                        </span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="text-xl font-bold text-green-600 mt-1">
                        {(
                          leaveSummary.overall_summary?.total_credited_days || 0
                        ).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">days</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Total Debited
                        </span>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="text-xl font-bold text-red-600 mt-1">
                        {(
                          leaveSummary.overall_summary?.total_debited_days || 0
                        ).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">days</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Available Balance
                        </span>
                        <Wallet className="h-4 w-4 text-blue-500" />
                      </div>
                      <div
                        className={`text-xl font-bold mt-1 ${
                          (leaveSummary.overall_summary?.net_balance || 0) < 0
                            ? "text-red-600"
                            : parseFloat(formData.Tot_Days) >
                                (leaveSummary.overall_summary?.net_balance || 0)
                              ? "text-orange-600"
                              : "text-blue-600"
                        }`}
                      >
                        {(leaveSummary.overall_summary?.net_balance || 0).toFixed(
                          2,
                        )}
                      </div>
                      <div className="text-xs text-gray-400">days</div>
                    </div>
                  </div>

                  {/* Warning message when balance is insufficient */}
                  {(leaveSummary.overall_summary?.net_balance || 0) <
                    parseFloat(formData.Tot_Days || 0) && (
                    <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-xs text-amber-700">
                          {leaveSummary.overall_summary?.net_balance <= 0
                            ? "No paid leave balance available. This leave will be fully unpaid."
                            : `Insufficient paid leave balance. ${(parseFloat(formData.Tot_Days) - (leaveSummary.overall_summary?.net_balance || 0)).toFixed(2)} days will be unpaid.`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* From Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={fromDateRef}
                    type="date"
                    name="Fr_Date"
                    value={formData.Fr_Date}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, toDateRef)}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.Fr_Date ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                  {errors.Fr_Date && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.Fr_Date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Fr_Date}
                  </p>
                )}
              </div>

              {/* To Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={toDateRef}
                    type="date"
                    name="To_Date"
                    value={formData.To_Date}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, reasonRef)}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.To_Date ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                  {errors.To_Date && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.To_Date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.To_Date}
                  </p>
                )}
              </div>

              {/* Half Day Row with 2 sections */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* From Date Half Day */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      From Date Half Day
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {halfDayOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <label
                            key={option.value}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                              formData.FDt_hfDy == option.value
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="FDt_hfDy"
                              value={option.value}
                              checked={formData.FDt_hfDy == option.value}
                              onChange={(e) =>
                                handleHalfDayChange("FDt_hfDy", e.target.value)
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* To Date Half Day */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      To Date Half Day
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {halfDayOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <label
                            key={option.value}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                              formData.TDt_hfDy == option.value
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="TDt_hfDy"
                              value={option.value}
                              checked={formData.TDt_hfDy == option.value}
                              onChange={(e) =>
                                handleHalfDayChange("TDt_hfDy", e.target.value)
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Breakdown */}
              {(paidDays > 0 || unpaidDays > 0) && (
                <div className="md:col-span-2">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-xs text-gray-500">Paid Leave:</span>
                        <span className="ml-2 text-lg font-bold text-green-600">
                          {paidDays.toFixed(2)} days
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">
                          Unpaid Leave:
                        </span>
                        <span className="ml-2 text-lg font-bold text-red-600">
                          {unpaidDays.toFixed(2)} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Days *
                </label>
                <div className="relative">
                  <FileDigit className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="Tot_Days"
                    value={formData.Tot_Days}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.Tot_Days ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50`}
                    step="0.5"
                    readOnly
                    required
                  />
                  {errors.Tot_Days && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.Tot_Days && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Tot_Days}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    ref={reasonRef}
                    name="Reason"
                    value={formData.Reason}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key == "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        contactRef.current?.focus();
                      }
                    }}
                    rows={3}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.Reason ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter reason for leave"
                    required
                  />
                  {errors.Reason && (
                    <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                  )}
                </div>
                {errors.Reason && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.Reason}
                  </p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={contactRef}
                    type="text"
                    name="Lv_Cnt"
                    value={formData.Lv_Cnt}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, addressRef)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contact number during leave"
                  />
                </div>
              </div>

              {/* Leave Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    ref={addressRef}
                    name="Lv_Adr"
                    value={formData.Lv_Adr}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key == "Enter" && !e.shiftKey) {
                        e.preventDefault();
                      }
                    }}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Address during leave"
                  />
                </div>
              </div>

              {/* Holiday Options - Auto-detected */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Holiday Options
                </label>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="Prx_HlDy"
                      checked={formData.Prx_HlDy}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      disabled={true}
                    />
                    <span className="text-sm text-gray-700">
                      Prefix Holiday {loadingHolidays && "(Checking...)"}
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="Sfx_HlDy"
                      checked={formData.Sfx_HlDy}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      disabled={true}
                    />
                    <span className="text-sm text-gray-700">
                      Suffix Holiday {loadingHolidays && "(Checking...)"}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Automatically detected when immediate previous or next day is a
                  holiday
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm text-gray-600">
                Fields marked with * are required
              </p>
              {initialActionId && !isEditMode && (
                <p className="text-xs text-green-600 mt-1">
                  Status will be set to initial stage
                </p>
              )}
            </div>
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
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? "Update Application" : "Create Application"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  export default AddEditLeaveApplication;
