// src/pages/Transactions/AttendanceManagement/Attendance/AttendanceRegularizationEntry/AddEdit.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  User,
  AlertCircle,
  ChevronDown,
  Search,
  Loader,
  XCircle,
  FileText,
  Clock,
  Briefcase,
  MapPin,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { AttendanceRegularizationApi } from "../../../../services/attendanceregularizationapi";

// Searchable Dropdown Component
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
  highlightedIndex,
  onSelect,
  onKeyDown,
  onSearchKeyDown,
  onItemKeyDown,
  getSelectedDisplay,
  loading,
  placeholder,
  searchPlaceholder,
  buttonRef,
  dropdownRef,
  searchRef,
  itemRefs,
  listRef,
  disabled = false,
  renderItem,
}) => {
  return (
    <div ref={dropdownRef} className="relative">
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
          onKeyDown={!disabled ? onKeyDown : undefined}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 border ${
            error ? "border-red-300" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          } transition-colors`}
        >
          {value ? (
            <span className="text-gray-900 truncate block">
              {getSelectedDisplay()}
            </span>
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
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ minWidth: "300px" }}
        >
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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

          <div ref={listRef} className="overflow-y-auto max-h-64">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => (
                <button
                  key={item.Emp_Id || item.id || idx}
                  ref={(el) => {
                    if (el && itemRefs.current) itemRefs.current[idx] = el;
                  }}
                  type="button"
                  onClick={() => onSelect(item)}
                  onKeyDown={(e) => onItemKeyDown(e, item, idx)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                    highlightedIndex == idx ? "bg-blue-100" : "text-gray-700"
                  }`}
                  tabIndex={0}
                >
                  {renderItem ? renderItem(item) : item.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No items found</p>
              </div>
            )}
          </div>
        </div>
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

const AddEditAttendanceRegularization = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState({
    totalDays: 0,
    holidays: 0,
    workingDays: 0,
  });
  const [pageTitle, setPageTitle] = useState("Attendance Regularization");

  // Permission and approval states
  const [currentStage, setCurrentStage] = useState(null);
  const [initialActionId, setInitialActionId] = useState(null);
  const [userDesignationId, setUserDesignationId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [actionsList, setActionsList] = useState([]);

  // Employee dropdown states
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeHighlightedIndex, setEmployeeHighlightedIndex] = useState(-1);
  const employeeDropdownRef = useRef(null);
  const employeeSearchRef = useRef(null);
  const employeeItemRefs = useRef([]);
  const employeeListRef = useRef(null);
  const employeeButtonRef = useRef(null);

  // Refs for focus management
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const reasonSelectRef = useRef(null);
  const placeVisitRef = useRef(null);
  const remarksRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const reasonOptions = [
    { value: "BIOMETRIC_FAILURE", label: "Biometric Failure" },
    { value: "FORGOT_PUNCH", label: "Forgot Punch" },
    { value: "FIELD_DUTY", label: "Field Duty" },
    { value: "OFFICIAL_VISIT", label: "Official Visit" },
    { value: "TOUR", label: "Tour" },
    { value: "SYSTEM_ERROR", label: "System Error" },
    { value: "OTHER", label: "Other" },
  ];

  const [formData, setFormData] = useState({
    Emp_Id: "",
    ARG_FDt: new Date().toISOString().split("T")[0],
    ARG_TDt: new Date().toISOString().split("T")[0],
    ARG_Rsn: "",
    Reason: "",
    ARG_Days: "",
    HlDy_Btwn: "",
    PlaceVisit: "",
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Load menu title and permissions
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const menuDetails = JSON.parse(
          localStorage.getItem("menu_details") || "[]",
        );
        const currentPath =
          "/transactions/attendance-management/attendance/attendance-regularization-entry";
        const currentMenuItem = menuDetails.find(
          (item) => item.Menu_Links == currentPath,
        );

        if (currentMenuItem) {
          setPageTitle(
            currentMenuItem.Fnc_Title || "Attendance Regularization",
          );

          if (currentMenuItem.action && currentMenuItem.action.stage) {
            const stage = currentMenuItem.action.stage;
            setCurrentStage(stage);
            await loadActionsForStage(stage);
          }
        }
      } catch (error) {
        console.error("Error loading menu title:", error);
      }
    };

    loadMenuData();
  }, []);

  // Get user designation for permission check
  useEffect(() => {
    const adminCheck = user?.roleId == 1 || user?.apiUserData?.Usr_Role_Id == 1;
    setIsAdmin(adminCheck);

    const desigId =
      user?.apiUserData?.employee?.personal_profile?.designation?.Dsg_id;
    setUserDesignationId(desigId ? parseInt(desigId) : null);
  }, [user]);

  // Load actions for stage to get initial action ID
  const loadActionsForStage = async (stage) => {
    if (!stage) return;

    try {
      const response = await AttendanceRegularizationApi.getAllByStage(stage);

      if (response.status && response.data) {
        const actions = response.data;
        setActionsList(actions);

        const initialAction = actions.find((action) => !action.Previous_Status);
        if (initialAction) {
          setInitialActionId(initialAction.Act_Id);
        }

        // Check create permission
        if (!isAdmin && userDesignationId) {
          const hasPermission = actions.some((action) => {
            const isAuthority = action.authorities_details?.some(
              (auth) => parseInt(auth.Dsg_id) == userDesignationId,
            );
            return isAuthority && !action.Previous_Status;
          });

          setHasCreatePermission(hasPermission);

          if (!hasPermission && !isEditMode) {
            toast.error(
              "You don't have permission to create attendance regularization requests",
            );
            navigate(
              "/transactions/attendance-management/attendance/attendance-regularization-entry",
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
    loadEmployees();
    loadHolidays();

    if (id && id != "create") {
      setIsEditMode(true);
      loadRegularizationData();
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => startDateRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  useEffect(() => {
    if (isEmployeeDropdownOpen && employeeSearchRef.current) {
      setTimeout(() => employeeSearchRef.current.focus(), 0);
    }
  }, [isEmployeeDropdownOpen]);

  useEffect(() => {
    if (!employeeSearchTerm.trim()) {
      setFilteredEmployees(employees);
    } else {
      const term = employeeSearchTerm.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          (emp.First_Name?.toLowerCase() || "").includes(term) ||
          (emp.Last_Name?.toLowerCase() || "").includes(term),
      );
      setFilteredEmployees(filtered);
    }
    setEmployeeHighlightedIndex(-1);
  }, [employeeSearchTerm, employees]);

  // Calculate days when dates change
  useEffect(() => {
    if (formData.ARG_FDt && formData.ARG_TDt) {
      const days = AttendanceRegularizationApi.calculateDays(
        formData.ARG_FDt,
        formData.ARG_TDt,
        holidays,
      );
      setCalculatedDays(days);
      setFormData((prev) => ({
        ...prev,
        ARG_Days: days.workingDays.toString(),
        HlDy_Btwn: days.holidays.toString(),
      }));
    }
  }, [formData.ARG_FDt, formData.ARG_TDt, holidays]);

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const empData = await AttendanceRegularizationApi.getEmployees();
      setEmployees(empData || []);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadHolidays = async () => {
    setLoadingHolidays(true);
    try {
      const holidayData = await AttendanceRegularizationApi.getHolidays();
      setHolidays(holidayData || []);
    } catch (error) {
      console.error("Error loading holidays:", error);
    } finally {
      setLoadingHolidays(false);
    }
  };

  const loadRegularizationData = async () => {
    setLoading(true);
    try {
      const data = await AttendanceRegularizationApi.getById(id);

      setFormData({
        Emp_Id: data.Emp_Id?.toString() || "",
        ARG_FDt: data.ARG_FDt || new Date().toISOString().split("T")[0],
        ARG_TDt: data.ARG_TDt || new Date().toISOString().split("T")[0],
        ARG_Rsn: data.ARG_Rsn || "",
        Reason: data.Reason || "",
        ARG_Days: data.ARG_Days || "",
        HlDy_Btwn: data.HlDy_Btwn || "",
        PlaceVisit: data.PlaceVisit || "",
      });

      if (data.employee) {
        setSelectedEmployee(data.employee);
      }

      setTimeout(() => startDateRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error loading attendance regularization data:", error);
      toast.error("Failed to load attendance regularization data!");
      navigate(
        "/transactions/attendance-management/attendance/attendance-regularization-entry",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEmployeeSelect = (employee) => {
    setFormData((prev) => ({ ...prev, Emp_Id: employee.Emp_Id?.toString() }));
    setSelectedEmployee(employee);
    setIsEmployeeDropdownOpen(false);
    setEmployeeSearchTerm("");
    setEmployeeHighlightedIndex(-1);

    if (errors.Emp_Id) {
      setErrors((prev) => ({ ...prev, Emp_Id: "" }));
    }

    setTimeout(() => startDateRef.current?.focus(), 100);
  };

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
          if (employeeItemRefs.current[0]) employeeItemRefs.current[0].focus();
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
          if (employeeItemRefs.current[nextIndex])
            employeeItemRefs.current[nextIndex].focus();
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
          if (employeeItemRefs.current[prevIndex])
            employeeItemRefs.current[prevIndex].focus();
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

  const getSelectedEmployeeDisplay = () => {
    if (!selectedEmployee) return "";
    return `${selectedEmployee.First_Name || ""} ${selectedEmployee.Last_Name || ""}`;
  };

  const renderEmployeeItem = (employee) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">
        {employee.First_Name || ""} {employee.Last_Name || ""}
      </div>
    </div>
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Emp_Id) {
      newErrors.Emp_Id = "Employee selection is required";
    }
    if (!formData.ARG_FDt) {
      newErrors.ARG_FDt = "Start date is required";
    }
    if (!formData.ARG_TDt) {
      newErrors.ARG_TDt = "End date is required";
    }
    if (
      formData.ARG_FDt &&
      formData.ARG_TDt &&
      new Date(formData.ARG_FDt) > new Date(formData.ARG_TDt)
    ) {
      newErrors.ARG_TDt = "End date must be after start date";
    }
    if (!formData.ARG_Rsn) {
      newErrors.ARG_Rsn = "Reason is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check permission for create
    if (!isEditMode && !hasCreatePermission && !isAdmin) {
      toast.error(
        "You don't have permission to create attendance regularization requests",
      );
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) toast.error(errors[firstErrorKey]);
      return;
    }

    const result = await Swal.fire({
      title: isEditMode
        ? "Update Attendance Regularization?"
        : "Create Attendance Regularization?",
      text: isEditMode
        ? "Are you sure you want to update this attendance regularization request?"
        : "Are you sure you want to create this attendance regularization request?",
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
      const submitData = {
        Emp_Id: parseInt(formData.Emp_Id),
        ARG_FDt: formData.ARG_FDt,
        ARG_TDt: formData.ARG_TDt,
        ARG_Rsn: formData.ARG_Rsn,
        Reason: formData.Reason || null,
        ARG_Days: parseFloat(formData.ARG_Days) || 0,
        HlDy_Btwn: parseFloat(formData.HlDy_Btwn) || 0,
        PlaceVisit: formData.PlaceVisit || null,
      };

      // Add Status only for CREATE (not for edit)
      if (!isEditMode) {
        submitData.Status = initialActionId ? initialActionId : "";
      }

      if (isEditMode) {
        await AttendanceRegularizationApi.update(id, submitData);
        toast.success("Attendance regularization updated successfully!");
      } else {
        await AttendanceRegularizationApi.create(submitData);
        toast.success("Attendance regularization created successfully!");
      }

      setTimeout(() => {
        navigate(
          "/transactions/attendance-management/attendance/attendance-regularization-entry",
        );
      }, 1500);
    } catch (error) {
      console.error("Error saving:", error);

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
            "Failed to save attendance regularization",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(
      "/transactions/attendance-management/attendance/attendance-regularization-entry",
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          Loading attendance regularization data...
        </p>
      </div>
    );
  }

  // Check permission for create mode
  if (!isEditMode && !hasCreatePermission && !isAdmin && !loading) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to create attendance regularization
          requests.
        </p>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handleCancel}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? `Edit ${pageTitle}` : `New ${pageTitle}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update attendance regularization request"
                : "Create a new attendance regularization request"}
            </p>
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-1">
                Designation ID: {userDesignationId} | Stage: {currentStage}
              </p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Request Details
                </h2>
              </div>

              <div className="space-y-6">
                {/* Employee Selection */}
                <SearchableDropdown
                  label="Employee"
                  value={formData.Emp_Id}
                  error={errors.Emp_Id}
                  required={true}
                  icon={User}
                  isOpen={isEmployeeDropdownOpen}
                  setIsOpen={setIsEmployeeDropdownOpen}
                  searchTerm={employeeSearchTerm}
                  setSearchTerm={setEmployeeSearchTerm}
                  items={employees}
                  filteredItems={filteredEmployees}
                  highlightedIndex={employeeHighlightedIndex}
                  onSelect={handleEmployeeSelect}
                  onKeyDown={handleEmployeeKeyDown}
                  onSearchKeyDown={handleEmployeeSearchKeyDown}
                  onItemKeyDown={handleEmployeeItemKeyDown}
                  getSelectedDisplay={getSelectedEmployeeDisplay}
                  loading={loadingEmployees}
                  placeholder="Select Employee"
                  searchPlaceholder="Search by name or code..."
                  buttonRef={employeeButtonRef}
                  dropdownRef={employeeDropdownRef}
                  searchRef={employeeSearchRef}
                  itemRefs={employeeItemRefs}
                  listRef={employeeListRef}
                  renderItem={renderEmployeeItem}
                />

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={startDateRef}
                        type="date"
                        name="ARG_FDt"
                        value={formData.ARG_FDt}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 border ${
                          errors.ARG_FDt ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                    {errors.ARG_FDt && (
                      <p className="mt-1 text-xs text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.ARG_FDt}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={endDateRef}
                        type="date"
                        name="ARG_TDt"
                        value={formData.ARG_TDt}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-2.5 border ${
                          errors.ARG_TDt ? "border-red-300" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                    {errors.ARG_TDt && (
                      <p className="mt-1 text-xs text-red-600 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.ARG_TDt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Calculated Days Display */}
                {formData.ARG_FDt && formData.ARG_TDt && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Info className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">
                        Date Calculation Summary
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-blue-600">Total Days</p>
                        <p className="text-lg font-bold text-blue-700">
                          {calculatedDays.totalDays}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Holidays</p>
                        <p className="text-lg font-bold text-blue-700">
                          {calculatedDays.holidays}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Working Days</p>
                        <p className="text-lg font-bold text-green-700">
                          {calculatedDays.workingDays}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <select
                      ref={reasonSelectRef}
                      name="ARG_Rsn"
                      value={formData.ARG_Rsn}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        errors.ARG_Rsn ? "border-red-300" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                    >
                      <option value="">Select Reason</option>
                      {reasonOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.ARG_Rsn && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.ARG_Rsn}
                    </p>
                  )}
                </div>

                {/* Place of Visit - Shown for certain reasons */}
                {(formData.ARG_Rsn == "FIELD_DUTY" ||
                  formData.ARG_Rsn == "OFFICIAL_VISIT" ||
                  formData.ARG_Rsn == "TOUR") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Place of Visit
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={placeVisitRef}
                        type="text"
                        name="PlaceVisit"
                        value={formData.PlaceVisit}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter place of visit"
                      />
                    </div>
                  </div>
                )}

                {/* Remarks / Detailed Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks / Detailed Reason
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      ref={remarksRef}
                      name="Reason"
                      value={formData.Reason}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Provide additional details about the reason..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Request Summary
                    </h2>
                    <p className="text-sm text-gray-600">
                      Attendance regularization details
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Employee</span>
                  <span className="font-medium text-gray-900 text-right">
                    {selectedEmployee
                      ? `${selectedEmployee.First_Name || ""} ${selectedEmployee.Last_Name || ""}`
                      : "Not selected"}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Date Range</span>
                  <span className="font-medium text-gray-900 text-right">
                    {formData.ARG_FDt && formData.ARG_TDt
                      ? `${formData.ARG_FDt} to ${formData.ARG_TDt}`
                      : "Not selected"}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Days</span>
                  <span className="font-bold text-blue-600">
                    {formData.ARG_Days || 0} days
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Holidays in Range</span>
                  <span className="font-medium text-orange-600">
                    {formData.HlDy_Btwn || 0} days
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Reason</span>
                  <span className="font-medium text-gray-900 text-right">
                    {reasonOptions.find((o) => o.value == formData.ARG_Rsn)
                      ?.label || "Not selected"}
                  </span>
                </div>
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
                Status will be set to:{" "}
                {actionsList.find((a) => a.Act_Id == initialActionId)
                  ?.St_Name || "Initial"}
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
                  {isEditMode ? "Update Request" : "Create Request"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditAttendanceRegularization;
