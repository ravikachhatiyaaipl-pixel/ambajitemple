// leave-credits/addedit.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Check,
  Building,
  Briefcase,
  Users,
  User,
  XCircle,
  Loader,
  Info,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { LeaveCreditsApi } from "../../../../services/leavecreditsapi";

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
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
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
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                        isSelected ? "bg-blue-50" : "text-gray-700"
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
                        <div className="text-xs text-blue-600 mt-1 flex items-center">
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

const AddEditLeaveCredits = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedLeaveTypeDetails, setSelectedLeaveTypeDetails] =
    useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    PRB_id: "",
    Dpt_Id: "",
    Dsg_Id: "",
    Emp_Id: "",
  });

  // Filter dropdown data
  const [payrollBillData, setPayrollBillData] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [flattenedDesignations, setFlattenedDesignations] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);

  // Filtered data for dropdowns
  const [filteredPayrollBills, setFilteredPayrollBills] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Employee summary data from filter
  const [employeeSummary, setEmployeeSummary] = useState([]);
  const [filteredEmployeeSummary, setFilteredEmployeeSummary] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [employeeSearchKeyword, setEmployeeSearchKeyword] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    LT_Date: new Date().toISOString().split("T")[0],
    Fy_Id: "",
    LT_id: "",
    Emp_Id: "",
    Tr_Type: "ACCRUAL",
    Tr_Date: new Date().toISOString().split("T")[0],
    Tr_Days: "",
    Tr_Mode: "C",
  });

  // Dropdown states
  const [fyData, setFyData] = useState([]);
  const [leaveTypeData, setLeaveTypeData] = useState([]);
  const [filteredFy, setFilteredFy] = useState([]);
  const [filteredLeaveTypes, setFilteredLeaveTypes] = useState([]);

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

  const [isPayrollBillDropdownOpen, setIsPayrollBillDropdownOpen] =
    useState(false);
  const [payrollBillSearchTerm, setPayrollBillSearchTerm] = useState("");
  const payrollBillDropdownRef = useRef(null);
  const payrollBillSearchRef = useRef(null);
  const payrollBillButtonRef = useRef(null);

  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
    useState(false);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const departmentDropdownRef = useRef(null);
  const departmentSearchRef = useRef(null);
  const departmentButtonRef = useRef(null);

  const [isDesignationDropdownOpen, setIsDesignationDropdownOpen] =
    useState(false);
  const [designationSearchTerm, setDesignationSearchTerm] = useState("");
  const designationDropdownRef = useRef(null);
  const designationSearchRef = useRef(null);
  const designationButtonRef = useRef(null);

  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const employeeDropdownRef = useRef(null);
  const employeeSearchRef = useRef(null);
  const employeeButtonRef = useRef(null);

  const ltDateRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  // Tree helper functions
  const buildDepartmentTree = (depts) => {
    const map = {};
    const roots = [];
    depts.forEach((dept) => {
      map[dept.Dpt_id] = {
        ...dept,
        children: [],
        level: dept.GrStt ? parseInt(dept.GrStt) : 1,
      };
    });
    depts.forEach((dept) => {
      const parentId = dept.UpGrp;
      if (parentId && map[parentId] && parentId != dept.Dpt_id) {
        map[parentId].children.push(map[dept.Dpt_id]);
      } else {
        roots.push(map[dept.Dpt_id]);
      }
    });
    return roots;
  };

  const buildDesignationTree = (desgs) => {
    const map = {};
    const roots = [];
    desgs.forEach((desg) => {
      map[desg.Dsg_id] = {
        ...desg,
        children: [],
        level: desg.GrStt ? parseInt(desg.GrStt) : 1,
      };
    });
    desgs.forEach((desg) => {
      const parentId = desg.UpGrp;
      if (parentId && map[parentId] && parentId != desg.Dsg_id) {
        map[parentId].children.push(map[desg.Dsg_id]);
      } else {
        roots.push(map[desg.Dsg_id]);
      }
    });
    return roots;
  };

  const flattenTree = (nodes, level = 1, result = []) => {
    nodes.forEach((node) => {
      const nodeLevel = node.level || level;
      result.push({ ...node, treeLevel: nodeLevel });
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, nodeLevel + 1, result);
      }
    });
    return result;
  };

  const getLevelColor = (level) => {
    const colors = {
      1: "bg-blue-100 text-blue-700",
      2: "bg-green-100 text-green-700",
      3: "bg-amber-100 text-amber-700",
      4: "bg-purple-100 text-purple-700",
    };
    return colors[level] || "bg-gray-100 text-gray-700";
  };

  // Initialize
  useEffect(() => {
    loadDropdownData();

    const handleClickOutside = (event) => {
      if (
        fyDropdownRef.current &&
        !fyDropdownRef.current.contains(event.target)
      )
        setIsFyDropdownOpen(false);
      if (
        leaveTypeDropdownRef.current &&
        !leaveTypeDropdownRef.current.contains(event.target)
      )
        setIsLeaveTypeDropdownOpen(false);
      if (
        payrollBillDropdownRef.current &&
        !payrollBillDropdownRef.current.contains(event.target)
      )
        setIsPayrollBillDropdownOpen(false);
      if (
        departmentDropdownRef.current &&
        !departmentDropdownRef.current.contains(event.target)
      )
        setIsDepartmentDropdownOpen(false);
      if (
        designationDropdownRef.current &&
        !designationDropdownRef.current.contains(event.target)
      )
        setIsDesignationDropdownOpen(false);
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target)
      )
        setIsEmployeeDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [
        fyResponse,
        leaveTypeResponse,
        payrollBillResponse,
        departmentResponse,
        designationResponse,
        employeeResponse,
      ] = await Promise.all([
        LeaveCreditsApi.getAllFinancialYears(),
        LeaveCreditsApi.getAllLeaveTypes(),
        LeaveCreditsApi.getAllPayrollBills(),
        LeaveCreditsApi.getAllDepartments(),
        LeaveCreditsApi.getAllDesignations(),
        LeaveCreditsApi.getAllEmployees(),
      ]);

      if (fyResponse.success) {
        setFyData(fyResponse.data);
        setFilteredFy(fyResponse.data);
        const currentYear = fyResponse.data.find(
          (fy) => fy.is_current_year == true,
        );
        if (currentYear && !formData.Fy_Id) {
          setFormData((prev) => ({
            ...prev,
            Fy_Id: currentYear.FY_Id.toString(),
          }));
        }
      }

      if (leaveTypeResponse.success) {
        setLeaveTypeData(leaveTypeResponse.data);
        setFilteredLeaveTypes(leaveTypeResponse.data);
      }

      if (payrollBillResponse.success) {
        setPayrollBillData(payrollBillResponse.data);
        setFilteredPayrollBills(payrollBillResponse.data);
      }

      if (departmentResponse.success) {
        const tree = buildDepartmentTree(departmentResponse.data);
        const flattened = flattenTree(tree);
        setFlattenedDepartments(flattened);
        setFilteredDepartments(flattened);
      }

      if (designationResponse.status == "success") {
        const tree = buildDesignationTree(designationResponse.data);
        const flattened = flattenTree(tree);
        setFlattenedDesignations(flattened);
        setFilteredDesignations(flattened);
      }

      if (employeeResponse.status) {
        setEmployeeData(employeeResponse.data);
        setFilteredEmployees(employeeResponse.data);
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Filter handlers
  useEffect(() => {
    if (!fySearchTerm.trim()) {
      setFilteredFy(fyData);
    } else {
      const term = fySearchTerm.toLowerCase();
      setFilteredFy(
        fyData.filter(
          (item) =>
            item.FY_Code?.toLowerCase().includes(term) ||
            item.FY_Name?.toLowerCase().includes(term),
        ),
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
            item.LT_code?.toLowerCase().includes(term),
        ),
      );
    }
  }, [leaveTypeSearchTerm, leaveTypeData]);

  useEffect(() => {
    if (!payrollBillSearchTerm.trim()) {
      setFilteredPayrollBills(payrollBillData);
    } else {
      const term = payrollBillSearchTerm.toLowerCase();
      setFilteredPayrollBills(
        payrollBillData.filter(
          (item) =>
            item.PayBill_Code?.toLowerCase().includes(term) ||
            item.Description?.toLowerCase().includes(term),
        ),
      );
    }
  }, [payrollBillSearchTerm, payrollBillData]);

  useEffect(() => {
    if (!departmentSearchTerm.trim()) {
      setFilteredDepartments(flattenedDepartments);
    } else {
      const term = departmentSearchTerm.toLowerCase();
      setFilteredDepartments(
        flattenedDepartments.filter(
          (item) =>
            item.Dpt_Name?.toLowerCase().includes(term) ||
            item.Dpt_Desc?.toLowerCase().includes(term),
        ),
      );
    }
  }, [departmentSearchTerm, flattenedDepartments]);

  useEffect(() => {
    if (!designationSearchTerm.trim()) {
      setFilteredDesignations(flattenedDesignations);
    } else {
      const term = designationSearchTerm.toLowerCase();
      setFilteredDesignations(
        flattenedDesignations.filter(
          (item) =>
            item.Dsg_Desc?.toLowerCase().includes(term) ||
            item.Dsg_EName?.toLowerCase().includes(term),
        ),
      );
    }
  }, [designationSearchTerm, flattenedDesignations]);

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
            item.Emp_Code?.toLowerCase().includes(term),
        ),
      );
    }
  }, [employeeSearchTerm, employeeData]);

  useEffect(() => {
    if (!employeeSearchKeyword.trim()) {
      setFilteredEmployeeSummary(employeeSummary);
    } else {
      const term = employeeSearchKeyword.toLowerCase();
      setFilteredEmployeeSummary(
        employeeSummary.filter(
          (emp) =>
            emp.Emp_Id?.toString().includes(term) ||
            (emp.Emp_Name || `${emp.First_Name || ""} ${emp.Last_Name || ""}`)
              .toLowerCase()
              .includes(term) ||
            emp.profile?.Join_Date?.includes(term),
        ),
      );
    }
  }, [employeeSearchKeyword, employeeSummary]);

  // Update selected leave type details
  useEffect(() => {
    if (formData.LT_id) {
      const selected = leaveTypeData.find(
        (lt) => lt.LT_id == parseInt(formData.LT_id),
      );
      setSelectedLeaveTypeDetails(selected || null);
    } else {
      setSelectedLeaveTypeDetails(null);
    }
  }, [formData.LT_id, leaveTypeData]);

  // Sync Tr_Date with LT_Date
  useEffect(() => {
    setFormData((prev) => ({ ...prev, Tr_Date: prev.LT_Date }));
  }, [formData.LT_Date]);

  // Auto-set Tr_Type
  useEffect(() => {
    if (formData.LT_id) {
      setFormData((prev) => ({ ...prev, Tr_Type: "ACCRUAL" }));
    }
  }, [formData.LT_id]);

  // Calculate all employee days
  useEffect(() => {
    const calculateAllEmployeeDays = () => {
      if (!formData.LT_id || !formData.Fy_Id) {
        console.log("Skipping - Missing LT_id or Fy_Id");
        return;
      }

      if (!filteredEmployeeSummary || filteredEmployeeSummary.length == 0) {
        console.log("Skipping - No employees");
        return;
      }

      const selectedFY = fyData.find(
        (fy) => fy.FY_Id == parseInt(formData.Fy_Id),
      );
      const selectedLeaveType = leaveTypeData.find(
        (lt) => lt.LT_id == parseInt(formData.LT_id),
      );

      if (!selectedFY || !selectedLeaveType) {
        console.log("Skipping - Missing FY or Leave Type");
        return;
      }

      const monthlyAccrualDays = parseFloat(selectedLeaveType.Acr_Days) || 0;
      const maxDays = parseFloat(selectedLeaveType.Max_days) || 0;

      console.log("==  BULK CALCULATION START ===");
      console.log("FY Code:", selectedFY.FY_Code);
      console.log("FY Start Date from API:", selectedFY.St_Date);
      console.log("FY End Date from API:", selectedFY.Ed_Date);
      console.log("Leave Type:", selectedLeaveType.LT_name);
      console.log("Monthly Accrual:", monthlyAccrualDays);

      const newCache = {};

      filteredEmployeeSummary.forEach((emp) => {
        const joiningDate = emp.profile?.Join_Date;

        if (joiningDate && monthlyAccrualDays > 0) {
          const joinDate = new Date(joiningDate);
          const fyStart = new Date(selectedFY.St_Date);
          const fyEnd = new Date(selectedFY.Ed_Date);

          let effectiveStartDate = joinDate > fyStart ? joinDate : fyStart;

          if (effectiveStartDate > fyEnd) {
            newCache[emp.Emp_Id] = 0;
            console.log(`❌ Emp ${emp.Emp_Id}: Joined after FY end`);
            return;
          }

          let totalMonths = 0;
          let currentDate = new Date(effectiveStartDate);
          let firstMonthMultiplier = 1;

          if (joinDate > fyStart && joinDate.getDate() > 1) {
            firstMonthMultiplier = joinDate.getDate() >= 16 ? 0.5 : 1;
            currentDate.setMonth(currentDate.getMonth() + 1);
            currentDate.setDate(1);
          } else if (joinDate < fyStart) {
            currentDate = new Date(fyStart);
          } else if (joinDate.getDate() == 1) {
            currentDate = new Date(joinDate);
          }

          while (currentDate <= fyEnd) {
            totalMonths++;
            currentDate.setMonth(currentDate.getMonth() + 1);
          }

          let totalDays =
            totalMonths * monthlyAccrualDays +
            (firstMonthMultiplier == 0.5
              ? monthlyAccrualDays * 0.5
              : firstMonthMultiplier == 1 && joinDate > fyStart
                ? monthlyAccrualDays
                : 0);

          if (maxDays > 0 && totalDays > maxDays) {
            totalDays = maxDays;
          }

          newCache[emp.Emp_Id] = Math.round(totalDays * 100) / 100;
          console.log(
            `✅ Emp ${emp.Emp_Id}: ${newCache[emp.Emp_Id]} days total`,
          );
        } else {
          newCache[emp.Emp_Id] = null;
          console.log(`❌ Emp ${emp.Emp_Id}: No joining date`);
        }
      });

      setEmployeeDaysCache(newCache);
      console.log("==  BULK CALCULATION END ===");
    };

    calculateAllEmployeeDays();
  }, [
    filteredEmployeeSummary,
    formData.LT_id,
    formData.Fy_Id,
    fyData,
    leaveTypeData,
  ]);

  // Fetch employee summary when filters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEmployeeSummary();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [filters.PRB_id, filters.Dpt_Id, filters.Dsg_Id, filters.Emp_Id]);

  const fetchEmployeeSummary = async () => {
    const hasFilter =
      filters.PRB_id || filters.Dpt_Id || filters.Dsg_Id || filters.Emp_Id;
    if (!hasFilter) {
      setEmployeeSummary([]);
      setFilteredEmployeeSummary([]);
      setSelectedEmployeeIds([]);
      setSelectAll(false);
      return;
    }

    setLoadingSummary(true);
    try {
      const response = await LeaveCreditsApi.getEmployeePayrollReport(filters);

      if (response.success) {
        const employees = response.data?.employees || [];
        setEmployeeSummary(employees);
        setFilteredEmployeeSummary(employees);

        if (filters.Emp_Id && employees.length == 1) {
          setSelectedEmployeeIds([filters.Emp_Id]);
        } else {
          setSelectedEmployeeIds([]);
        }
        setSelectAll(false);
      } else {
        setEmployeeSummary([]);
        setFilteredEmployeeSummary([]);
      }
    } catch (error) {
      console.error("Error fetching employee summary:", error);
      setEmployeeSummary([]);
      setFilteredEmployeeSummary([]);
    } finally {
      setLoadingSummary(false);
    }
  };

  const [employeeDaysCache, setEmployeeDaysCache] = useState({});

  const handleSelectEmployee = (empId, hasJoiningDate) => {
    if (!hasJoiningDate) {
      toast.error("Cannot select employee: No joining date found");
      return;
    }

    setSelectedEmployeeIds((prev) => {
      if (prev.includes(empId)) {
        return prev.filter((id) => id != empId);
      } else {
        return [...prev, empId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployeeIds([]);
    } else {
      const validEmployeeIds = filteredEmployeeSummary
        .filter((emp) => emp.profile?.Join_Date)
        .map((emp) => emp.Emp_Id?.toString());
      setSelectedEmployeeIds(validEmployeeIds);
    }
    setSelectAll(!selectAll);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key != "Emp_Id") {
      setSelectedEmployeeIds([]);
      setSelectAll(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      PRB_id: "",
      Dpt_Id: "",
      Dsg_Id: "",
      Emp_Id: "",
    });
    setEmployeeSummary([]);
    setFilteredEmployeeSummary([]);
    setSelectedEmployeeIds([]);
    setSelectAll(false);
    setEmployeeSearchKeyword("");
    setPayrollBillSearchTerm("");
    setDepartmentSearchTerm("");
    setDesignationSearchTerm("");
    setEmployeeSearchTerm("");
    toast.success("All filters cleared");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  // Dropdown handlers
  const handleFySelect = (item) => {
    setFormData((prev) => ({ ...prev, Fy_Id: item.FY_Id.toString() }));
    setIsFyDropdownOpen(false);
    setFySearchTerm("");
    if (errors.Fy_Id) setErrors((prev) => ({ ...prev, Fy_Id: "" }));
    setTimeout(() => leaveTypeButtonRef.current?.focus(), 100);
  };

  const handleLeaveTypeSelect = (item) => {
    setFormData((prev) => ({ ...prev, LT_id: item.LT_id.toString() }));
    setIsLeaveTypeDropdownOpen(false);
    setLeaveTypeSearchTerm("");
    if (errors.LT_id) setErrors((prev) => ({ ...prev, LT_id: "" }));
  };

  const handlePayrollBillSelect = (item) => {
    handleFilterChange("PRB_id", item.PRB_id.toString());
    setIsPayrollBillDropdownOpen(false);
    setPayrollBillSearchTerm("");
  };

  const handleDepartmentSelect = (item) => {
    handleFilterChange("Dpt_Id", item.Dpt_id.toString());
    setIsDepartmentDropdownOpen(false);
    setDepartmentSearchTerm("");
    handleFilterChange("Dsg_Id", "");
  };

  const handleDesignationSelect = (item) => {
    handleFilterChange("Dsg_Id", item.Dsg_id.toString());
    setIsDesignationDropdownOpen(false);
    setDesignationSearchTerm("");
  };

  const handleEmployeeSelect = (item) => {
    handleFilterChange("Emp_Id", item.Emp_Id.toString());
    setIsEmployeeDropdownOpen(false);
    setEmployeeSearchTerm("");
  };

  // Display functions
  const getSelectedFyName = () => {
    if (!formData.Fy_Id) return "";
    const selected = fyData.find(
      (item) => item.FY_Id == parseInt(formData.Fy_Id),
    );
    return selected ? `${selected.FY_Code} - ${selected.FY_Name}` : "";
  };

  const getSelectedLeaveTypeName = () => {
    if (!formData.LT_id) return "";
    const selected = leaveTypeData.find(
      (item) => item.LT_id == parseInt(formData.LT_id),
    );
    return selected ? selected.LT_name : "";
  };

  const getSelectedPayrollBillName = () => {
    if (!filters.PRB_id) return "";
    const selected = payrollBillData.find(
      (item) => item.PRB_id == parseInt(filters.PRB_id),
    );
    return selected ? `${selected.PayBill_Code} - ${selected.Description}` : "";
  };

  const getSelectedDepartmentName = () => {
    if (!filters.Dpt_Id) return "";
    const selected = flattenedDepartments.find(
      (item) => item.Dpt_id == parseInt(filters.Dpt_Id),
    );
    return selected ? selected.Dpt_Desc || selected.Dpt_Name || "" : "";
  };

  const getSelectedDesignationName = () => {
    if (!filters.Dsg_Id) return "";
    const selected = flattenedDesignations.find(
      (item) => item.Dsg_id == parseInt(filters.Dsg_Id),
    );
    return selected ? selected.Dsg_Desc || "" : "";
  };

  const getSelectedEmployeeName = () => {
    if (!filters.Emp_Id) return "";
    const selected = employeeData.find(
      (item) => item.Emp_Id == parseInt(filters.Emp_Id),
    );
    return selected ? `${selected.First_Name} ${selected.Last_Name || ""}` : "";
  };

  // Render functions
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
        Code: {item.LT_code} | Max: {item.Max_days} days
      </div>
      <div className="text-xs text-gray-400">
        Accrual: {item.Acr_Plcy} - {item.Acr_Days} days/month
      </div>
    </div>
  );

  const renderDepartmentItem = (dept) => {
    const level = dept.treeLevel || 1;
    const colorClass = getLevelColor(level);
    const indent = (level - 1) * 20;
    return (
      <div className="py-1">
        <div className="flex items-start">
          <div
            className={`h-6 w-6 rounded flex items-center justify-center mr-3 flex-shrink-0 ${colorClass}`}
          >
            <span className="text-xs font-bold">L{level}</span>
          </div>
          <div className="flex-1">
            <div
              className="text-sm font-medium text-gray-900"
              style={{ marginLeft: `${indent}px` }}
            >
              {dept.Dpt_Desc || dept.Dpt_Name}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDesignationItem = (desg) => {
    const level = desg.treeLevel || 1;
    const colorClass = getLevelColor(level);
    const indent = (level - 1) * 20;
    return (
      <div className="py-1">
        <div className="flex items-start">
          <div
            className={`h-6 w-6 rounded flex items-center justify-center mr-3 flex-shrink-0 ${colorClass}`}
          >
            <span className="text-xs font-bold">L{level}</span>
          </div>
          <div className="flex-1">
            <div
              className="text-sm font-medium text-gray-900"
              style={{ marginLeft: `${indent}px` }}
            >
              {desg.Dsg_Desc}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPayrollBillItem = (item) => (
    <div>
      <div className="font-medium text-gray-900">{item.PayBill_Code}</div>
      <div className="text-xs text-gray-500">{item.Description}</div>
    </div>
  );

  const renderEmployeeItem = (item) => (
    <div>
      <div className="font-medium text-gray-900">
        {item.First_Name} {item.Last_Name || ""}
      </div>
      <div className="text-xs text-gray-500">
        Code: {item.Emp_Code || "N/A"}
      </div>
    </div>
  );

  const validateForm = () => {
    const newErrors = {};
    if (!formData.LT_Date)
      newErrors.LT_Date = "Leave transaction date is required";
    if (!formData.Fy_Id) newErrors.Fy_Id = "Financial year is required";
    if (!formData.LT_id) newErrors.LT_id = "Leave type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) toast.error(errors[firstErrorKey]);
      return;
    }

    let employeesToProcess = [];

    if (selectedEmployeeIds.length > 0) {
      employeesToProcess = selectedEmployeeIds;
    } else if (formData.Emp_Id) {
      employeesToProcess = [formData.Emp_Id];
    } else {
      toast.error("Please select at least one employee");
      return;
    }

    const selectedFY = fyData.find(
      (fy) => fy.FY_Id == parseInt(formData.Fy_Id),
    );
    const selectedLeaveType = leaveTypeData.find(
      (lt) => lt.LT_id == parseInt(formData.LT_id),
    );

    if (!selectedFY || !selectedLeaveType) {
      toast.error("Invalid financial year or leave type");
      return;
    }

    const monthlyAccrualDays = parseFloat(selectedLeaveType.Acr_Days) || 0;
    const maxDays = parseFloat(selectedLeaveType.Max_days) || 0;

    const bulkPayload = [];

    for (const empId of employeesToProcess) {
      const employee = employeeSummary.find(
        (emp) => emp.Emp_Id == parseInt(empId),
      );

      if (!employee?.profile?.Join_Date) {
        toast.warning(
          `Employee ${employee?.First_Name || empId} has no joining date, skipping`,
        );
        continue;
      }

      const joinDate = new Date(employee.profile.Join_Date);
      const fyStart = new Date(selectedFY.St_Date);
      const fyEnd = new Date(selectedFY.Ed_Date);

      let effectiveStartDate = joinDate > fyStart ? joinDate : fyStart;

      if (effectiveStartDate > fyEnd) {
        toast.warning(
          `Employee ${employee.First_Name} joined after FY end, skipping`,
        );
        continue;
      }

      let firstMonthDays = monthlyAccrualDays;
      let firstMonthDate = new Date(effectiveStartDate);

      if (joinDate > fyStart && joinDate.getDate() > 1) {
        const joinDay = joinDate.getDate();
        if (joinDay >= 16) {
          firstMonthDays = monthlyAccrualDays * 0.5;
        }
        firstMonthDate = new Date(
          joinDate.getFullYear(),
          joinDate.getMonth(),
          1,
        );
      } else if (joinDate < fyStart) {
        firstMonthDate = new Date(fyStart);
      } else if (joinDate.getDate() == 1) {
        firstMonthDate = new Date(joinDate);
      }

      let currentDate = new Date(firstMonthDate);
      let totalDaysAccrued = 0;

      while (currentDate <= fyEnd) {
        let daysForMonth = monthlyAccrualDays;

        if (currentDate.getTime() == firstMonthDate.getTime()) {
          daysForMonth = firstMonthDays;
        }

        if (maxDays > 0 && totalDaysAccrued + daysForMonth > maxDays) {
          daysForMonth = maxDays - totalDaysAccrued;
          if (daysForMonth <= 0) break;
        }

        bulkPayload.push({
          LT_Date: formData.LT_Date,
          Fy_Id: parseInt(formData.Fy_Id),
          LT_id: parseInt(formData.LT_id),
          Emp_Id: parseInt(empId),
          Tr_Type: "ACCRUAL",
          Tr_Date: currentDate.toISOString().split("T")[0],
          Tr_Days: daysForMonth,
          Tr_Mode: "C",
        });

        totalDaysAccrued += daysForMonth;
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setDate(1);
      }
    }

    if (bulkPayload.length == 0) {
      toast.error("No eligible employees found for leave credit");
      return;
    }

    const result = await Swal.fire({
      title: `Create ${bulkPayload.length} Monthly Leave Credits?`,
      text: `This will create ${bulkPayload.length} monthly transaction(s) for ${employeesToProcess.length} employee(s). Continue?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, create!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      await LeaveCreditsApi.createBulk(bulkPayload);
      toast.success(
        `${bulkPayload.length} monthly leave transaction(s) created successfully!`,
      );

      setTimeout(() => {
        navigate("/transactions/attendance-management/leave/leave-credits");
      }, 1500);
    } catch (error) {
      console.error("Error saving:", error);
      toast.error(
        error.response?.data?.message || "Failed to save leave transaction(s)",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/transactions/attendance-management/leave/leave-credits");
  };

  return (
    <div className="p-6 mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate(
                "/transactions/attendance-management/leave/leave-credits",
              )
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              New Leave Credit
            </h1>
            <p className="text-gray-600 mt-1">
              Create leave credit for employees
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Leave Credit Details Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Leave Credit Details
              </h2>
            </div>
          </div>

          <div className="p-6">
            {/* Row 1: Leave Credit Date, Financial Year, Leave Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Credit Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={ltDateRef}
                    type="date"
                    name="LT_Date"
                    value={formData.LT_Date}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, fyButtonRef)}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.LT_Date ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {errors.LT_Date && (
                  <p className="mt-1 text-sm text-red-600">{errors.LT_Date}</p>
                )}
              </div>

              <div>
                <SearchableDropdown
                  label="Financial Year"
                  value={formData.Fy_Id}
                  error={errors.Fy_Id}
                  required={true}
                  icon={Calendar}
                  isOpen={isFyDropdownOpen}
                  setIsOpen={setIsFyDropdownOpen}
                  searchTerm={fySearchTerm}
                  setSearchTerm={setFySearchTerm}
                  items={fyData}
                  filteredItems={filteredFy}
                  onSelect={handleFySelect}
                  getSelectedDisplay={getSelectedFyName}
                  loading={loadingDropdowns}
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
                  value={formData.LT_id}
                  error={errors.LT_id}
                  required={true}
                  icon={Layers}
                  isOpen={isLeaveTypeDropdownOpen}
                  setIsOpen={setIsLeaveTypeDropdownOpen}
                  searchTerm={leaveTypeSearchTerm}
                  setSearchTerm={setLeaveTypeSearchTerm}
                  items={leaveTypeData}
                  filteredItems={filteredLeaveTypes}
                  onSelect={handleLeaveTypeSelect}
                  getSelectedDisplay={getSelectedLeaveTypeName}
                  loading={loadingDropdowns}
                  placeholder="Select leave type"
                  searchPlaceholder="Search leave type..."
                  buttonRef={leaveTypeButtonRef}
                  dropdownRef={leaveTypeDropdownRef}
                  searchRef={leaveTypeSearchRef}
                  getId={(item) => item.LT_id?.toString()}
                  renderItem={renderLeaveTypeItem}
                />
              </div>
            </div>

            {/* Leave Type Summary Card */}
            {selectedLeaveTypeDetails && (
              <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="flex items-center mb-3">
                  <Info className="h-4 w-4 text-indigo-600 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Leave Type Summary
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Leave Name</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedLeaveTypeDetails.LT_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Leave Code</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedLeaveTypeDetails.LT_code}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Maximum Days</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedLeaveTypeDetails.Max_days} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Accrual Policy</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedLeaveTypeDetails.Acr_Plcy} -{" "}
                      {selectedLeaveTypeDetails.Acr_Days} days/month
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Row 2: Payroll Bill, Department, Designation, Specific Employee */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <SearchableDropdown
                  label="Payroll Bill"
                  value={filters.PRB_id}
                  icon={FileText}
                  isOpen={isPayrollBillDropdownOpen}
                  setIsOpen={setIsPayrollBillDropdownOpen}
                  searchTerm={payrollBillSearchTerm}
                  setSearchTerm={setPayrollBillSearchTerm}
                  items={payrollBillData}
                  filteredItems={filteredPayrollBills}
                  onSelect={handlePayrollBillSelect}
                  getSelectedDisplay={getSelectedPayrollBillName}
                  loading={loadingDropdowns}
                  placeholder="Select payroll bill"
                  searchPlaceholder="Search payroll bill..."
                  buttonRef={payrollBillButtonRef}
                  dropdownRef={payrollBillDropdownRef}
                  searchRef={payrollBillSearchRef}
                  getId={(item) => item.PRB_id?.toString()}
                  renderItem={renderPayrollBillItem}
                />
              </div>

              <div>
                <SearchableDropdown
                  label="Department"
                  value={filters.Dpt_Id}
                  icon={Building}
                  isOpen={isDepartmentDropdownOpen}
                  setIsOpen={setIsDepartmentDropdownOpen}
                  searchTerm={departmentSearchTerm}
                  setSearchTerm={setDepartmentSearchTerm}
                  items={flattenedDepartments}
                  filteredItems={filteredDepartments}
                  onSelect={handleDepartmentSelect}
                  getSelectedDisplay={getSelectedDepartmentName}
                  loading={loadingDropdowns}
                  placeholder="Select department"
                  searchPlaceholder="Search department..."
                  buttonRef={departmentButtonRef}
                  dropdownRef={departmentDropdownRef}
                  searchRef={departmentSearchRef}
                  getId={(item) => item.Dpt_id?.toString()}
                  renderItem={renderDepartmentItem}
                />
              </div>

              <div>
                <SearchableDropdown
                  label="Designation"
                  value={filters.Dsg_Id}
                  icon={Briefcase}
                  isOpen={isDesignationDropdownOpen}
                  setIsOpen={setIsDesignationDropdownOpen}
                  searchTerm={designationSearchTerm}
                  setSearchTerm={setDesignationSearchTerm}
                  items={flattenedDesignations}
                  filteredItems={filteredDesignations}
                  onSelect={handleDesignationSelect}
                  getSelectedDisplay={getSelectedDesignationName}
                  loading={loadingDropdowns}
                  placeholder="Select designation"
                  searchPlaceholder="Search designation..."
                  buttonRef={designationButtonRef}
                  dropdownRef={designationDropdownRef}
                  searchRef={designationSearchRef}
                  getId={(item) => item.Dsg_id?.toString()}
                  renderItem={renderDesignationItem}
                />
              </div>

              <div>
                <SearchableDropdown
                  label="Specific Employee"
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
                  loading={loadingDropdowns}
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

            {/* Clear Filters Button Row */}
            <div className="flex justify-end mb-6">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Filters
              </button>
            </div>

            {/* Hidden fields */}
            <input type="hidden" name="Tr_Type" value={formData.Tr_Type} />
            <input type="hidden" name="Tr_Date" value={formData.Tr_Date} />
            <input type="hidden" name="Tr_Days" value={formData.Tr_Days} />
            <input type="hidden" name="Tr_Mode" value={formData.Tr_Mode} />

            {/* Employee Summary Section */}
            {(filters.PRB_id ||
              filters.Dpt_Id ||
              filters.Dsg_Id ||
              filters.Emp_Id) && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-indigo-500 mr-2" />
                    <h3 className="text-sm font-medium text-gray-700">
                      Employee List ({filteredEmployeeSummary.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or joining date..."
                        value={employeeSearchKeyword}
                        onChange={(e) =>
                          setEmployeeSearchKeyword(e.target.value)
                        }
                        className="pl-10 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
                      />
                    </div>
                    {filteredEmployeeSummary.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        {selectAll ? "Deselect All" : "Select All"}
                      </button>
                    )}
                  </div>
                </div>

                {loadingSummary ? (
                  <div className="flex justify-center py-8">
                    <Loader className="h-6 w-6 text-indigo-500 animate-spin" />
                  </div>
                ) : filteredEmployeeSummary.length > 0 ? (
                  <>
                    <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="w-10 px-3 py-2">
                              <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
                                className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                              />
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">
                              Employee Name
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">
                              Joining Date
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">
                              Total Days
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredEmployeeSummary.map((emp) => {
                            const joiningDate = emp.profile?.Join_Date;
                            const hasJoiningDate = !!joiningDate;
                            const calculatedDays =
                              employeeDaysCache[emp.Emp_Id];
                            const isValid =
                              hasJoiningDate &&
                              calculatedDays != null &&
                              calculatedDays != undefined;

                            return (
                              <tr
                                key={emp.Emp_Id}
                                className={`hover:bg-gray-50 ${!hasJoiningDate ? "opacity-50 bg-gray-100" : ""}`}
                              >
                                <td className="px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedEmployeeIds.includes(
                                      emp.Emp_Id?.toString(),
                                    )}
                                    onChange={() =>
                                      handleSelectEmployee(
                                        emp.Emp_Id?.toString(),
                                        hasJoiningDate,
                                      )
                                    }
                                    disabled={!hasJoiningDate}
                                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 disabled:opacity-50"
                                  />
                                </td>
                                <td className="px-3 py-2 font-medium text-gray-800">
                                  {emp.Emp_Name ||
                                    `${emp.First_Name || ""} ${emp.Last_Name || ""}`}
                                </td>
                                <td className="px-3 py-2 text-gray-500">
                                  {joiningDate
                                    ? new Date(joiningDate).toLocaleDateString()
                                    : "Not Available"}
                                </td>
                                <td className="px-3 py-2">
                                  {isValid ? (
                                    <span className="font-medium text-blue-600">
                                      {calculatedDays} days
                                    </span>
                                  ) : (
                                    <span className="text-red-500 text-xs">
                                      Cannot Calculate
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {selectedEmployeeIds.length > 0 && (
                          <span>
                            {selectedEmployeeIds.length} employee(s) selected
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedEmployeeIds.length > 1 && (
                      <p className="text-xs text-amber-600 mt-2">
                        Note: Multiple employees selected. Monthly transactions
                        will be created for all selected employees.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p>No employees found with selected filters</p>
                  </div>
                )}
              </div>
            )}

            {!filters.PRB_id &&
              !filters.Dpt_Id &&
              !filters.Dsg_Id &&
              !filters.Emp_Id && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg mt-4">
                  <Info className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p>Apply filters above to see employees</p>
                  <p className="text-xs mt-1">
                    Select Payroll Bill, Department, Designation, or Employee
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 mt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with * are required
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Note: Leave calculation is based on Financial Year selected (April
              to March)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Joining date between 1st-15th = Full month credit | 16th-31st =
              Half month credit
            </p>
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Leave Credits
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditLeaveCredits;
