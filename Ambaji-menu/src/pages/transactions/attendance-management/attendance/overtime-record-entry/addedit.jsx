// overtime-record-entry/addedit.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  AlertCircle,
  ChevronDown,
  Search,
  ChevronUp,
  Check,
  Clock,
  User,
  FileText,
  Briefcase,
  Eye,
  Hash,
  Watch,
  Sunrise,
  Sunset,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { OverTimeRecordApi } from "../../../../services/overtimerecordapi";

const AddEditOverTimeRecord = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [pageTitle, setPageTitle] = useState("Overtime Record Entry");
  const [currentStage, setCurrentStage] = useState(null);
  const [initialActionId, setInitialActionId] = useState(null);
  const [userDeptId, setUserDeptId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCreatePermission, setHasCreatePermission] = useState(false);

  // Holiday data
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  // Employee dropdown states
  const [employeeData, setEmployeeData] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeHighlightedIndex, setEmployeeHighlightedIndex] = useState(-1);
  const employeeDropdownRef = useRef(null);
  const employeeSearchRef = useRef(null);
  const employeeItemRefs = useRef([]);
  const employeeListRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  // Shift status flags (for display)
  const [showEarlyComing, setShowEarlyComing] = useState(false);
  const [showLateGoing, setShowLateGoing] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    OTR_Date: new Date().toISOString().split("T")[0],
    Emp_Id: "",
    In_Time: "",
    Out_Time: "",
    OTR_Hrs: "",
    Early_Coming: "N",
    Late_Going: "N",
    Prx_HlDy: false,
    Sfx_HlDy: false,
    Reason: "",
  });

  // Refs for focus management
  const dateInputRef = useRef(null);
  const employeeButtonRef = useRef(null);
  const inTimeRef = useRef(null);
  const outTimeRef = useRef(null);
  const reasonInputRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  // Load holidays on mount
  useEffect(() => {
    loadHolidays();
  }, []);

  // Auto-calculate overtime hours and shift status when In_Time or Out_Time changes
  useEffect(() => {
    if (formData.In_Time && formData.Out_Time && formData.OTR_Date) {
      const inDateTime = `${formData.OTR_Date}T${formData.In_Time}`;
      const outDateTime = `${formData.OTR_Date}T${formData.Out_Time}`;
      const inTimeDate = new Date(inDateTime);
      const outTimeDate = new Date(outDateTime);

      if (outTimeDate > inTimeDate) {
        // Calculate overtime hours in HH:MM format
        const calculatedHours = OverTimeRecordApi.calculateOvertimeHours(
          inDateTime,
          outDateTime,
        );

        // Check Early Coming (before 10:00 AM)
        const shiftStartTime = new Date(`${formData.OTR_Date}T10:00:00`);
        const earlyComing = inTimeDate < shiftStartTime;
        setShowEarlyComing(earlyComing);

        // Check Late Going (after 6:00 PM)
        const shiftEndTime = new Date(`${formData.OTR_Date}T18:00:00`);
        const lateGoing = outTimeDate > shiftEndTime;
        setShowLateGoing(lateGoing);

        setFormData((prev) => ({
          ...prev,
          OTR_Hrs: calculatedHours, // This will be in "HH:MM" format
          Early_Coming: earlyComing ? "Y" : "N",
          Late_Going: lateGoing ? "Y" : "N",
        }));

        if (errors.OTR_Hrs) {
          setErrors((prev) => ({ ...prev, OTR_Hrs: "" }));
        }
      } else if (outTimeDate <= inTimeDate) {
        setErrors((prev) => ({
          ...prev,
          Out_Time: "Out time must be after in time",
        }));
      }
    }
  }, [formData.In_Time, formData.Out_Time, formData.OTR_Date]);

  // Check for previous/subsequent CONSECUTIVE holidays when date changes
  useEffect(() => {
    if (isInitialLoadRef.current) return;

    if (formData.OTR_Date && holidays.length > 0) {
      const selectedDate = new Date(formData.OTR_Date);
      const isSelectedDateHoliday = OverTimeRecordApi.isHoliday(
        selectedDate,
        holidays,
      );
      const hasPrevHoliday = OverTimeRecordApi.hasPreviousConsecutiveHoliday(
        selectedDate,
        holidays,
      );
      const hasNextHoliday = OverTimeRecordApi.hasSubsequentConsecutiveHoliday(
        selectedDate,
        holidays,
      );

      setFormData((prev) => ({
        ...prev,
        Prx_HlDy: hasPrevHoliday,
        Sfx_HlDy: hasNextHoliday && !isSelectedDateHoliday,
      }));

      if (isSelectedDateHoliday && !isEditMode) {
        toast.error(
          "Selected date is a holiday! Overtime cannot be claimed on holidays.",
        );
      }
    }
  }, [formData.OTR_Date, holidays]);

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id, user]);

  const loadHolidays = async () => {
    setLoadingHolidays(true);
    try {
      const response = await OverTimeRecordApi.getAllHolidays();
      if (response.success && response.data) {
        setHolidays(response.data);
      }
    } catch (error) {
      console.error("Error loading holidays:", error);
    } finally {
      setLoadingHolidays(false);
    }
  };

  const loadMenuAndStage = async () => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/transactions/attendance-management/attendance/overtime-record-entry";
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
      const response = await OverTimeRecordApi.getAllByStage(stage);

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
            toast.error("You don't have permission to create new entries");
            navigate(
              "/transactions/attendance-management/attendance/overtime-record-entry",
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
    if (!loading && !isEditMode) {
      setTimeout(() => dateInputRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  useEffect(() => {
    if (isEmployeeDropdownOpen && employeeSearchRef.current) {
      setTimeout(() => employeeSearchRef.current.focus(), 0);
    }
  }, [isEmployeeDropdownOpen]);

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

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const employeesResponse = await OverTimeRecordApi.getAllEmployees();

      if (employeesResponse.status && employeesResponse.data) {
        setEmployeeData(employeesResponse.data);
        setFilteredEmployees(employeesResponse.data);
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load employee data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadEntryData = async () => {
    setLoading(true);
    try {
      const response = await OverTimeRecordApi.getById(id);

      // Format time from "HH:MM:SS" to "HH:MM" for time input
      const formatTimeForInput = (timeStr) => {
        if (!timeStr) return "";
        const parts = timeStr.split(":");
        return `${parts[0]}:${parts[1]}`;
      };

      // Convert OTR_Hrs from decimal to HH:MM if needed
      let overtimeHours = response?.OTR_Hrs || "00:00";
      if (typeof overtimeHours == "number" || !overtimeHours.includes(":")) {
        overtimeHours = OverTimeRecordApi.convertDecimalToTime(
          parseFloat(overtimeHours),
        );
      }

      setFormData({
        OTR_Date: response?.OTR_Date
          ? new Date(response.OTR_Date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        Emp_Id: response?.Emp_Id?.toString() || "",
        In_Time: response?.In_Time ? formatTimeForInput(response.In_Time) : "",
        Out_Time: response?.Out_Time
          ? formatTimeForInput(response.Out_Time)
          : "",
        OTR_Hrs: overtimeHours,
        Early_Coming: response?.Early_Coming == "Y" ? "Y" : "N",
        Late_Going: response?.Late_Going == "Y" ? "Y" : "N",
        Prx_HlDy:
          response?.Prx_HlDy == "1" ||
          response?.Prx_HlDy == 1 ||
          response?.Prx_HlDy == true,
        Sfx_HlDy:
          response?.Sfx_HlDy == "1" ||
          response?.Sfx_HlDy == 1 ||
          response?.Sfx_HlDy == true,
        Reason: response?.Reason || "",
      });

      // Set shift status flags for display
      if (response?.In_Time && response?.OTR_Date) {
        const inDateTime = new Date(
          `${response.OTR_Date}T${formatTimeForInput(response.In_Time)}`,
        );
        const shiftStart = new Date(`${response.OTR_Date}T10:00:00`);
        setShowEarlyComing(inDateTime < shiftStart);
      }
      if (response?.Out_Time && response?.OTR_Date) {
        const outDateTime = new Date(
          `${response.OTR_Date}T${formatTimeForInput(response.Out_Time)}`,
        );
        const shiftEnd = new Date(`${response.OTR_Date}T18:00:00`);
        setShowLateGoing(outDateTime > shiftEnd);
      }

      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 100);

      setTimeout(() => dateInputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error loading entry:", error);
      toast.error("Failed to load entry data!");
      navigate(
        "/transactions/attendance-management/attendance/overtime-record-entry",
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
          item.Emp_Code?.toString().includes(term) ||
          item.user?.Usr_Name?.toLowerCase().includes(term),
      );
      setFilteredEmployees(filtered);
    }
    setEmployeeHighlightedIndex(-1);
  }, [employeeSearchTerm, employeeData]);

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

    setTimeout(() => inTimeRef.current?.focus(), 100);
  };

  const getSelectedEmployeeName = () => {
    if (!formData.Emp_Id) return "";
    const selected = employeeData.find(
      (item) => item.Emp_Id == parseInt(formData.Emp_Id),
    );
    return selected
      ? `${selected.First_Name} ${selected.Last_Name || ""}`.trim() ||
          selected.user?.Usr_Name ||
          ""
      : "";
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
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

    if (!formData.OTR_Date) {
      newErrors.OTR_Date = "Date is required";
    }

    if (!formData.Emp_Id) {
      newErrors.Emp_Id = "Employee selection is required";
    }

    if (!formData.In_Time) {
      newErrors.In_Time = "In time is required";
    }

    if (!formData.Out_Time) {
      newErrors.Out_Time = "Out time is required";
    }

    if (formData.In_Time && formData.Out_Time && formData.OTR_Date) {
      const inDateTime = new Date(`${formData.OTR_Date}T${formData.In_Time}`);
      const outDateTime = new Date(`${formData.OTR_Date}T${formData.Out_Time}`);
      if (outDateTime <= inDateTime) {
        newErrors.Out_Time = "Out time must be after in time";
      }
    }

    // Validate overtime hours format (HH:MM)
    if (!formData.OTR_Hrs || formData.OTR_Hrs == "00:00") {
      newErrors.OTR_Hrs = "Overtime hours must be greater than 0";
    } else {
      const [hours, minutes] = formData.OTR_Hrs.split(":");
      const totalHours = parseInt(hours) + parseInt(minutes) / 60;
      if (totalHours > 24) {
        newErrors.OTR_Hrs = "Overtime hours cannot exceed 24 hours";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const preparePayload = () => {
    // Convert OTR_Hrs from HH:MM to decimal for API
    const overtimeDecimal = OverTimeRecordApi.convertTimeToDecimal(
      formData.OTR_Hrs,
    );

    const payload = {
      OTR_Date: formData.OTR_Date,
      Emp_Id: parseInt(formData.Emp_Id),
      In_Time: formData.In_Time,
      Out_Time: formData.Out_Time,
      OTR_Hrs: overtimeDecimal, // Send decimal to API
      Early_Coming: formData.Early_Coming,
      Late_Going: formData.Late_Going,
      Prx_HlDy: formData.Prx_HlDy ? 1 : 0,
      Sfx_HlDy: formData.Sfx_HlDy ? 1 : 0,
      Reason: formData.Reason || null,
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
        ? "Update Overtime Record?"
        : "Create New Overtime Record?",
      text: isEditMode
        ? "Are you sure you want to update this overtime record?"
        : "Are you sure you want to create this new overtime record?",
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
        await OverTimeRecordApi.update(id, payload);
        toast.success("Overtime record updated successfully!");
      } else {
        await OverTimeRecordApi.create(payload);
        toast.success("Overtime record created successfully!");
      }

      setTimeout(() => {
        navigate(
          "/transactions/attendance-management/attendance/overtime-record-entry",
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
              ? "Failed to update entry. Please try again."
              : "Failed to create entry. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(
      "/transactions/attendance-management/attendance/overtime-record-entry",
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
                "/transactions/attendance-management/attendance/overtime-record-entry",
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
                ? "Update overtime record information"
                : "Create new overtime record"}
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
              <Clock className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Overtime Record Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={dateInputRef}
                  type="date"
                  name="OTR_Date"
                  value={formData.OTR_Date}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, employeeButtonRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.OTR_Date ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
                {errors.OTR_Date && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.OTR_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.OTR_Date}
                </p>
              )}
            </div>

            {/* Employee Dropdown */}
            <div ref={employeeDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Employee *
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
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                    >
                      {formData.Emp_Id ? (
                        <span className="text-gray-900 block truncate">
                          {getSelectedEmployeeName()}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Select an Employee
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

                {isEmployeeDropdownOpen && !loadingDropdowns && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={employeeSearchRef}
                          type="text"
                          value={employeeSearchTerm}
                          onChange={(e) =>
                            setEmployeeSearchTerm(e.target.value)
                          }
                          onKeyDown={handleEmployeeSearchKeyDown}
                          placeholder="Search by name or code..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        {employeeSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setEmployeeSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
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
                            <div className="font-medium text-gray-900">
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
              {errors.Emp_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Emp_Id}
                </p>
              )}
            </div>

            {/* In Time Field with Early Coming Badge */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  In Time *
                </label>
                {showEarlyComing && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <Sunrise className="h-3 w-3 mr-1" />
                    Early Coming
                  </span>
                )}
              </div>
              <div className="relative">
                <Watch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inTimeRef}
                  type="time"
                  name="In_Time"
                  value={formData.In_Time}
                  onChange={handleTimeChange}
                  onKeyDown={(e) => handleEnterKey(e, outTimeRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.In_Time ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                  step="60"
                />
                {errors.In_Time && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.In_Time && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.In_Time}
                </p>
              )}
            </div>

            {/* Out Time Field with Late Going Badge */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Out Time *
                </label>
                {showLateGoing && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                    <Sunset className="h-3 w-3 mr-1" />
                    Late Going
                  </span>
                )}
              </div>
              <div className="relative">
                <Watch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={outTimeRef}
                  type="time"
                  name="Out_Time"
                  value={formData.Out_Time}
                  onChange={handleTimeChange}
                  onKeyDown={(e) => handleEnterKey(e, reasonInputRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Out_Time ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                  step="60"
                />
                {errors.Out_Time && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.Out_Time && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Out_Time}
                </p>
              )}
            </div>

            {/* Overtime Hours (Auto-calculated, read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Hours * (Auto-calculated)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="OTR_Hrs"
                  value={formData.OTR_Hrs}
                  readOnly
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.OTR_Hrs ? "border-red-300" : "border-gray-300"
                  } rounded-lg bg-gray-50 text-gray-700 font-mono`}
                  placeholder="Auto-calculated based on time (HH:MM)"
                />
                {errors.OTR_Hrs && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.OTR_Hrs && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.OTR_Hrs}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Shift time: 10:00 AM to 6:00 PM. Overtime calculated
                automatically in HH:MM format.
              </p>
            </div>

            {/* Previous Holiday - Auto-detected */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous Holiday
              </label>
              <div className="flex items-center mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="Prx_HlDy"
                    checked={formData.Prx_HlDy}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    disabled={true}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Include Previous Holiday{" "}
                    {loadingHolidays && "(Checking...)"}
                  </span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Automatically detected when immediate previous day is a holiday
              </p>
            </div>

            {/* Subsequent Holiday - Auto-detected */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subsequent Holiday
              </label>
              <div className="flex items-center mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="Sfx_HlDy"
                    checked={formData.Sfx_HlDy}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    disabled={true}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Include Subsequent Holiday{" "}
                    {loadingHolidays && "(Checking...)"}
                  </span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Automatically detected when immediate next day is a holiday
              </p>
            </div>

            {/* Reason */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  ref={reasonInputRef}
                  name="Reason"
                  value={formData.Reason}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key == "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      saveButtonRef.current?.focus();
                    }
                  }}
                  rows="3"
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.Reason ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter reason for overtime (optional)"
                />
              </div>
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
                Status will be set to: {initialActionId}
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
                  {isEditMode ? "Update Record" : "Create Record"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditOverTimeRecord;
