/***
 *
 *  Application Name: I3EMS
 *
 *  Developed By: Aark InfoSoft Pvt Ltd.
 *
 *  Version: Ambaji Mata Temple Management
 *
 *  All Rights Reserved, Unauthorized use, copying, or distribution is strictly prohibited.
 *  All source code, database structures, UI/UX designs, workflows,
 *  business logic, and documentation are confidential intellectual property.
 *  Reverse engineering, duplication, or redistribution without written permission
 *  is strictly prohibited and may result in legal action.
 *
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Building,
  Link,
  AlertCircle,
  ChevronDown,
  CheckCircle,
  Search,
  XCircle,
  Check,
  Filter,
  RefreshCw,
  PieChart,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import GraDeptMapApi from "../../../services/gradeptmapapi";

const AddEditGraDeptMap = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);
  const deptDropdownRef = useRef(null);
  const deptSearchRef = useRef(null);
  const deptItemRefs = useRef([]);
  const deptListRef = useRef(null);

  // Updated: Grant Types instead of Budget Heads
  const [grantTypes, setGrantTypes] = useState([]);
  const [filteredGrantTypes, setFilteredGrantTypes] = useState([]);
  const [grantSearchTerm, setGrantSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [initialLoad, setInitialLoad] = useState(true);
  const [checkingExistingMapping, setCheckingExistingMapping] = useState(false);
  const [existingMappingId, setExistingMappingId] = useState(null);
  const [loadingGrantTypes, setLoadingGrantTypes] = useState(false);

  // Refs for focus management
  const departmentButtonRef = useRef(null);
  const grantSearchRef = useRef(null);
  const filterAllRef = useRef(null);
  const filterSelectedRef = useRef(null);
  const filterUnselectedRef = useRef(null);
  const clearAllRef = useRef(null);
  const selectVisibleRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const lastClickTimeRef = useRef(0);

  const [formData, setFormData] = useState({
    Dept_Id: "",
    GT_Id: [], // Changed from Bh_Id to GT_Id
  });

  const [errors, setErrors] = useState({});

  // Click outside handler for department dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(event.target)
      ) {
        setIsDeptDropdownOpen(false);
        setDeptHighlightedIndex(-1);
        setDeptSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search when department dropdown opens
  useEffect(() => {
    if (isDeptDropdownOpen && deptSearchRef.current) {
      setTimeout(() => deptSearchRef.current.focus(), 0);
    }
  }, [isDeptDropdownOpen]);

  // Scroll highlighted department item into view
  useEffect(() => {
    if (
      isDeptDropdownOpen &&
      deptHighlightedIndex >= 0 &&
      deptListRef.current
    ) {
      const container = deptListRef.current;
      const item = deptItemRefs.current[deptHighlightedIndex];
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
  }, [deptHighlightedIndex, isDeptDropdownOpen]);

  useEffect(() => {
    loadDropdowns();

    if (id && id != "create") {
      setIsEditMode(true);
      setExistingMappingId(id);
    } else {
      const queryParams = new URLSearchParams(location.search);
      const deptId = queryParams.get("deptId");
      if (deptId) {
        setFormData((prev) => ({ ...prev, Dept_Id: deptId }));
        checkExistingMapping(deptId);
      }
    }
  }, [id, location]);

  useEffect(() => {
    if (isEditMode && id) {
      loadMappingData();
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (!deptSearchTerm.trim()) {
      setFilteredDepartments(departments);
    } else {
      const term = deptSearchTerm.toLowerCase();
      const filtered = departments.filter(
        (dept) =>
          dept.Dpt_Desc?.toLowerCase().includes(term) ||
          dept.Dpt_Name?.toLowerCase().includes(term) ||
          dept.GrCod?.toLowerCase().includes(term),
      );
      setFilteredDepartments(filtered);
    }
    setDeptHighlightedIndex(-1);
  }, [deptSearchTerm, departments]);

  // Updated filter for Grant Types
  useEffect(() => {
    if (initialLoad) return;

    let filtered = grantTypes;

    if (grantSearchTerm.trim()) {
      const term = grantSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (grant) =>
          grant.GT_Name?.toLowerCase().includes(term) ||
          grant.GT_Code?.toLowerCase().includes(term),
      );
    }

    if (filterType == "selected") {
      filtered = filtered.filter((grant) =>
        formData.GT_Id.includes(grant.GT_Id),
      );
    } else if (filterType == "unselected") {
      filtered = filtered.filter(
        (grant) => !formData.GT_Id.includes(grant.GT_Id),
      );
    }

    setFilteredGrantTypes(filtered);
  }, [grantSearchTerm, filterType, grantTypes, formData.GT_Id, initialLoad]);

  const checkExistingMapping = async (departmentId) => {
    if (!departmentId) return;

    setCheckingExistingMapping(true);
    try {
      const response = await GraDeptMapApi.getByDepartment(departmentId);

      if (response.success && response.data && response.data.length > 0) {
        const existingMapping = response.data[0];
        const existingId = existingMapping.GDM_Id;

        setExistingMappingId(existingId);
        setIsEditMode(true);

        // ✅ FIX: Wait for data to load before navigating
        await loadExistingMappingData(existingId);

        navigate(`/masters/grant-management/gra-dept-map/edit/${existingId}`, {
          replace: true,
        });
      } else {
        setFormData((prev) => ({ ...prev, GT_Id: [] }));
      }
    } catch (error) {
      console.error("Error checking existing mapping:", error);
      toast.error("Failed to check existing mapping");
    } finally {
      setCheckingExistingMapping(false);
    }
  };

  const loadExistingMappingData = async (mappingId) => {
    setLoading(true);
    try {
      const response = await GraDeptMapApi.getById(mappingId);
      if (response.success) {
        const mappingData = response.data;

        const grantTypeIds = mappingData.GT_Id || [];

        setFormData({
          Dept_Id: mappingData.Dept_Id?.toString() || "",
          GT_Id: grantTypeIds,
        });

        setFilterType("selected");
      } else {
        toast.error("Failed to load existing mapping data!");
      }
    } catch (error) {
      console.error("Error loading existing mapping:", error);
      toast.error("Failed to load existing mapping!");
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [deptResponse, grantResponse] = await Promise.all([
        GraDeptMapApi.getDepartments(),
        GraDeptMapApi.getGrantTypes(),
      ]);

      if (deptResponse.success) {
        const deptData = deptResponse.data || [];
        setDepartments(deptData);
        setFilteredDepartments(deptData);
      }

      if (grantResponse.success) {
        const grantData = grantResponse.data || [];
        const sortedGrantTypes = grantData.sort((a, b) => {
          return a.GT_Code?.localeCompare(b.GT_Code) || 0;
        });
        setGrantTypes(sortedGrantTypes);
        setFilteredGrantTypes(sortedGrantTypes);
        setInitialLoad(false);
      }
    } catch (error) {
      console.error("Failed to load dropdowns:", error);
      toast.error("Failed to load dropdown data");
    }
  };

  const loadMappingData = async () => {
    setLoading(true);
    try {
      const response = await GraDeptMapApi.getById(id);
      if (response.success) {
        const mappingData = response.data;

        const grantTypeIds = mappingData.GT_Id || [];

        setFormData({
          Dept_Id: mappingData.Dept_Id?.toString() || "",
          GT_Id: grantTypeIds,
        });

        setFilterType("selected");
      } else {
        toast.error("Failed to load mapping data!");
        navigate("/masters/grant-management/gra-dept-map");
      }
    } catch (error) {
      console.error("Error loading mapping:", error);
      toast.error("Failed to load mapping data!");
      navigate("/masters/grant-management/gra-dept-map");
    } finally {
      setLoading(false);
    }
  };

  // Department keyboard handlers
  const handleDepartmentKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsDeptDropdownOpen(true);
      setDeptSearchTerm("");
      setDeptHighlightedIndex(-1);
      setTimeout(() => deptSearchRef.current?.focus(), 0);
    }
  };

  const handleDepartmentSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredDepartments.length > 0) {
        setDeptHighlightedIndex(0);
        setTimeout(() => {
          if (deptItemRefs.current[0]) {
            deptItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      departmentButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredDepartments.length > 0 && deptHighlightedIndex >= 0) {
        handleDepartmentSelect(
          filteredDepartments[deptHighlightedIndex].Dpt_id,
        );
      } else if (filteredDepartments.length > 0) {
        handleDepartmentSelect(filteredDepartments[0].Dpt_id);
      }
    } else if (e.key == "Tab") {
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
    }
  };

  const handleDepartmentItemKeyDown = (e, deptId, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredDepartments.length) {
        setDeptHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (deptItemRefs.current[nextIndex]) {
            deptItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setDeptHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (deptItemRefs.current[prevIndex]) {
            deptItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleDepartmentSelect(deptId);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      departmentButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name == "Dept_Id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        GT_Id: [],
      }));

      if (value && !isEditMode) {
        checkExistingMapping(value);
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDepartmentSelect = (deptId) => {
    setFormData((prev) => ({
      ...prev,
      Dept_Id: deptId.toString(),
      GT_Id: [], // Clear grant types when department changes
    }));
    setIsDeptDropdownOpen(false);
    setDeptSearchTerm("");
    setDeptHighlightedIndex(-1);

    if (deptId && !isEditMode) {
      checkExistingMapping(deptId);
    }

    if (errors.Dept_Id) {
      setErrors((prev) => ({ ...prev, Dept_Id: null }));
    }

    // Focus on grant search after department selection
    setTimeout(() => grantSearchRef.current?.focus(), 100);
  };

  // Helper function to get department display name with level
  const getDepartmentDisplayName = (dept) => {
    if (!dept) return "";
    const level = parseInt(dept.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const displayName = dept.Dpt_Desc || dept.Dpt_Name || "Unnamed Department";
    return `${indent}${displayName}`;
  };

  const getSelectedDepartmentName = () => {
    if (!formData.Dept_Id) return "";
    const selectedDept = departments.find(
      (dept) => dept.Dpt_id.toString() == formData.Dept_Id,
    );
    return selectedDept ? getDepartmentDisplayName(selectedDept) : "";
  };

  // Updated: Grant Type selection handlers
  const handleGrantTypeSelection = (grantId) => {
    setFormData((prev) => {
      const currentIds = [...prev.GT_Id];

      if (currentIds.includes(grantId)) {
        return {
          ...prev,
          GT_Id: currentIds.filter((id) => id != grantId),
        };
      } else {
        return {
          ...prev,
          GT_Id: [...currentIds, grantId],
        };
      }
    });

    if (errors.GT_Id) {
      setErrors((prev) => ({ ...prev, GT_Id: null }));
    }
  };

  const handleRowClick = (grantId, e) => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 300) {
      lastClickTimeRef.current = now;
      return;
    }
    lastClickTimeRef.current = now;

    if (
      e.target.type == "checkbox" ||
      e.target.tagName == "INPUT" ||
      e.target.tagName == "BUTTON" ||
      e.target.closest("button") ||
      e.target.closest("a")
    ) {
      return;
    }

    const ignoreElements = ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"];
    if (ignoreElements.includes(e.target.tagName)) {
      return;
    }

    handleGrantTypeSelection(grantId);
  };

  const handleCheckboxClick = (grantId, e) => {
    if (e) {
      e.stopPropagation();
    }
    handleGrantTypeSelection(grantId);
  };

  const selectAllVisibleGrantTypes = () => {
    const allIds = filteredGrantTypes.map((grant) => grant.GT_Id);
    setFormData((prev) => ({
      ...prev,
      GT_Id: [...new Set([...prev.GT_Id, ...allIds])],
    }));
  };

  const deselectAllVisibleGrantTypes = () => {
    const visibleIds = filteredGrantTypes.map((grant) => grant.GT_Id);
    setFormData((prev) => ({
      ...prev,
      GT_Id: prev.GT_Id.filter((id) => !visibleIds.includes(id)),
    }));
  };

  const selectAllGrantTypes = () => {
    const allIds = grantTypes.map((grant) => grant.GT_Id);
    setFormData((prev) => ({
      ...prev,
      GT_Id: allIds,
    }));
  };

  const deselectAllGrantTypes = () => {
    setFormData((prev) => ({
      ...prev,
      GT_Id: [],
    }));
  };

  // General keyboard navigation for Enter key
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

    if (!formData.Dept_Id) {
      newErrors.Dept_Id = "Department is required";
    }

    if (formData.GT_Id.length == 0) {
      newErrors.GT_Id = "At least one grant type must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    const submitData = {
      Dept_Id: parseInt(formData.Dept_Id),
      GT_Id: formData.GT_Id, // Changed from Bh_Id to GT_Id
    };

    const selectedDepartment = departments.find(
      (dept) => dept.Dpt_id.toString() == formData.Dept_Id,
    );
    const selectedGrantTypes = grantTypes.filter((grant) =>
      formData.GT_Id.includes(grant.GT_Id),
    );

    const result = await Swal.fire({
      title: isEditMode ? "Update Mapping?" : "Create New Mapping?",
      html: `
        <div class="text-left">
          <p class="mb-2">${isEditMode ? "Update this department-grant type mapping?" : "Create a new department-grant type mapping?"}</p>
          <p class="text-sm text-gray-600 mb-1"><strong>Department:</strong> ${selectedDepartment?.Dpt_Desc || selectedDepartment?.Dpt_Name || selectedDepartment?.GrCod || "Not selected"}</p>
          <p class="text-sm text-gray-600 mb-2"><strong>Selected Grant Types:</strong> ${selectedGrantTypes.length} grant type(s)</p>
        </div>
      `,
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
      let response;

      const mappingId = existingMappingId || id;

      if (isEditMode) {
        if (!mappingId) {
          toast.error("Cannot update: No mapping ID found!");
          setSaving(false);
          return;
        }

        response = await GraDeptMapApi.update(mappingId, submitData);
        if (response.success) {
          toast.success("Mapping updated successfully!");
        } else {
          throw new Error(response.message || "Failed to update mapping");
        }
      } else {
        response = await GraDeptMapApi.create(submitData);
        if (response.success) {
          toast.success("Mapping created successfully!");
        } else {
          throw new Error(response.message || "Failed to create mapping");
        }
      }

      setTimeout(() => {
        navigate("/masters/grant-management/gra-dept-map");
      }, 1500);
    } catch (error) {
      console.error("Error saving mapping:", error);

      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const errorMessages = Object.values(apiErrors).flat().join(", ");
        toast.error(errorMessages);

        const fieldErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          fieldErrors[key] = apiErrors[key][0];
        });
        setErrors(fieldErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update mapping. Please try again."
            : "Failed to create mapping. Please try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/grant-management/gra-dept-map");
  };

  const refreshData = () => {
    loadDropdowns();
    if (isEditMode) {
      if (existingMappingId) {
        loadExistingMappingData(existingMappingId);
      } else if (id) {
        loadMappingData();
      }
    }
    toast.success("Data refreshed!");
  };

  const getSelectedDepartment = () => {
    return departments.find(
      (dept) => dept.Dpt_id.toString() == formData.Dept_Id,
    );
  };

  const getSelectedGrantTypes = () => {
    return grantTypes.filter((grant) => formData.GT_Id.includes(grant.GT_Id));
  };

  // Get level badge color
  const getDeptLevelColor = (level) => {
    const colors = {
      1: "bg-blue-100 text-blue-600",
      2: "bg-green-100 text-green-600",
      3: "bg-amber-100 text-amber-600",
      4: "bg-purple-100 text-purple-600",
    };
    return colors[level] || "bg-gray-100 text-gray-600";
  };

  // Get grant type status color
  const getGrantStatusColor = (isActive) => {
    return isActive
      ? "text-green-600 bg-green-100"
      : "text-gray-500 bg-gray-100";
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading mapping data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/masters/grant-management/gra-dept-map")}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? "Edit Department-Grant Type Mapping"
                : "Add New Department-Grant Type Mapping"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update department-grant type mapping information"
                : "Create a new mapping between department and grant types"}
            </p>
          </div>
        </div>

        <button
          onClick={refreshData}
          className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mapping Information Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center mr-3">
              <Link className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Mapping Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Department - Searchable Dropdown */}
            <div ref={deptDropdownRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                {checkingExistingMapping && (
                  <span className="text-xs text-blue-600 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-600 mr-1"></div>
                    Checking existing mapping...
                  </span>
                )}
              </div>

              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <button
                  ref={departmentButtonRef}
                  type="button"
                  onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                  onKeyDown={handleDepartmentKeyDown}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Dept_Id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                >
                  <span
                    className={
                      formData.Dept_Id ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {formData.Dept_Id
                      ? getSelectedDepartmentName()
                      : "Select a department *"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {isDeptDropdownOpen ? (
                    <ChevronDown className="h-4 w-4 transform rotate-180" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {errors.Dept_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {errors.Dept_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Dept_Id}
                </p>
              )}

              {/* Department Dropdown Menu */}
              {isDeptDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={deptSearchRef}
                        type="text"
                        value={deptSearchTerm}
                        onChange={(e) => setDeptSearchTerm(e.target.value)}
                        onKeyDown={handleDepartmentSearchKeyDown}
                        placeholder="Search departments by name, description, code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        autoFocus
                      />
                      {deptSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setDeptSearchTerm("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Departments List */}
                  <div ref={deptListRef} className="overflow-y-auto max-h-64">
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((dept, idx) => {
                        const isSelected =
                          formData.Dept_Id == dept.Dpt_id?.toString();
                        const level = parseInt(dept.GrStt, 10) || 1;

                        return (
                          <button
                            key={dept.Dpt_id}
                            ref={(el) => {
                              deptItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() => handleDepartmentSelect(dept.Dpt_id)}
                            onKeyDown={(e) =>
                              handleDepartmentItemKeyDown(e, dept.Dpt_id, idx)
                            }
                            onMouseEnter={() => setDeptHighlightedIndex(idx)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                              deptHighlightedIndex == idx
                                ? "bg-blue-100"
                                : isSelected
                                  ? "bg-blue-50"
                                  : ""
                            }`}
                            tabIndex={deptHighlightedIndex == idx ? 0 : -1}
                          >
                            <div className="flex items-center">
                              <div
                                className={`h-6 w-6 rounded flex items-center justify-center mr-3 ${getDeptLevelColor(level)}`}
                              >
                                <span className="text-xs font-bold">
                                  L{level}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div
                                  className="font-medium text-gray-900"
                                  style={{
                                    marginLeft: `${(level - 1) * 20}px`,
                                  }}
                                >
                                  {dept.Dpt_Desc || dept.Dpt_Name}
                                </div>
                                {dept.Dpt_Name &&
                                  dept.Dpt_Name != dept.Dpt_Desc && (
                                    <div
                                      className="text-xs text-gray-500 mt-0.5"
                                      style={{
                                        marginLeft: `${(level - 1) * 20}px`,
                                      }}
                                    >
                                      {dept.Dpt_Name}
                                    </div>
                                  )}
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-blue-600 ml-2" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Building className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p>No departments found</p>
                        {deptSearchTerm && (
                          <p className="text-xs mt-1">
                            Try a different search term
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        {filteredDepartments.length} departments found
                      </span>
                      <span className="text-gray-400">
                        Use ↑ ↓ to navigate, Enter to select
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <p className="mt-1 text-xs text-gray-500">
                {checkingExistingMapping
                  ? "Checking if mapping already exists for this department..."
                  : "Select department to map with multiple grant types"}
              </p>

              {/* Info about existing mapping */}
              {existingMappingId && !isEditMode && (
                <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
                    <div className="text-sm text-amber-700">
                      <span className="font-medium">
                        Existing mapping found!
                      </span>
                      <span className="ml-1">
                        You're now editing the existing mapping.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Grant Types - Multiple selection with simplified view */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Grant Types <span className="text-red-500">*</span>
                </label>
                <div className="text-xs text-gray-500">
                  Total: {grantTypes.length} | Selected: {formData.GT_Id.length}{" "}
                  | Showing: {filteredGrantTypes.length}
                </div>
              </div>

              {/* Search Bar for Grant Types */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={grantSearchRef}
                    type="text"
                    placeholder="Search grant types by name or code..."
                    value={grantSearchTerm}
                    onChange={(e) => setGrantSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key == "Enter") {
                        e.preventDefault();
                        filterAllRef.current?.focus();
                      }
                    }}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {grantSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setGrantSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs and Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    ref={filterAllRef}
                    type="button"
                    onClick={() => setFilterType("all")}
                    onKeyDown={(e) => handleEnterKey(e, filterSelectedRef)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center ${
                      filterType == "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    All ({grantTypes.length})
                  </button>
                  <button
                    ref={filterSelectedRef}
                    type="button"
                    onClick={() => setFilterType("selected")}
                    onKeyDown={(e) => handleEnterKey(e, filterUnselectedRef)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center ${
                      filterType == "selected"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Selected ({formData.GT_Id.length})
                  </button>
                  <button
                    ref={filterUnselectedRef}
                    type="button"
                    onClick={() => setFilterType("unselected")}
                    onKeyDown={(e) => handleEnterKey(e, clearAllRef)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center ${
                      filterType == "unselected"
                        ? "bg-gray-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Unselected ({grantTypes.length - formData.GT_Id.length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    ref={clearAllRef}
                    type="button"
                    onClick={deselectAllGrantTypes}
                    onKeyDown={(e) => handleEnterKey(e, selectVisibleRef)}
                    className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Clear All
                  </button>
                  <button
                    ref={selectVisibleRef}
                    type="button"
                    onClick={selectAllVisibleGrantTypes}
                    onKeyDown={(e) => handleEnterKey(e, cancelButtonRef)}
                    className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Select Visible
                  </button>
                </div>
              </div>

              {/* Grant Types List - Simplified view with only checkbox and name */}
              <div
                className={`border rounded-lg overflow-hidden ${
                  errors.GT_Id ? "border-red-300" : "border-gray-300"
                }`}
              >
                <div className="max-h-96 overflow-y-auto">
                  {filteredGrantTypes.length == 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <PieChart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No grant types found matching your criteria</p>
                      {(grantSearchTerm || filterType != "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setGrantSearchTerm("");
                            setFilterType("all");
                          }}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="w-12 px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={
                                filteredGrantTypes.length > 0 &&
                                filteredGrantTypes.every((grant) =>
                                  formData.GT_Id.includes(grant.GT_Id),
                                )
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  selectAllVisibleGrantTypes();
                                } else {
                                  deselectAllVisibleGrantTypes();
                                }
                              }}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Grant Type
                          </th>

                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredGrantTypes.map((grant) => {
                          const isSelected = formData.GT_Id.includes(
                            grant.GT_Id,
                          );

                          return (
                            <tr
                              key={grant.GT_Id}
                              className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                                isSelected ? "bg-blue-50" : ""
                              }`}
                              onClick={(e) => handleRowClick(grant.GT_Id, e)}
                              onDoubleClick={(e) => e.preventDefault()}
                            >
                              <td
                                className="px-4 py-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center h-5">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) =>
                                      handleCheckboxClick(grant.GT_Id, e)
                                    }
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                    id={`grant-checkbox-${grant.GT_Id}`}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="h-6 w-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                                    <Tag className="h-3 w-3" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {grant.GT_Name}
                                      {isSelected && (
                                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${getGrantStatusColor(grant.Is_Active)}`}
                                >
                                  {grant.Is_Active ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
              {errors.GT_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.GT_Id}
                </p>
              )}
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">
                    Click anywhere on a row to select/unselect.
                  </span>{" "}
                  Use checkboxes for precise control.
                </p>
                <span className="text-xs text-gray-500">
                  Filter:{" "}
                  {filterType == "all"
                    ? "All"
                    : filterType == "selected"
                      ? "Selected"
                      : "Unselected"}{" "}
                  • Showing: {filteredGrantTypes.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="flex items-center space-x-3 ml-auto">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  handleCancel();
                } else if (e.key == "Tab" && !e.shiftKey) {
                  e.preventDefault();
                  saveButtonRef.current?.focus();
                }
              }}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={
                saving ||
                !formData.Dept_Id ||
                formData.GT_Id.length == 0 ||
                checkingExistingMapping
              }
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  e.preventDefault();
                  handleSubmit(e);
                } else if (e.key == "Tab" && e.shiftKey) {
                  e.preventDefault();
                  cancelButtonRef.current?.focus();
                }
              }}
              className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all shadow-sm ${
                saving ||
                !formData.Dept_Id ||
                formData.GT_Id.length == 0 ||
                checkingExistingMapping
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Mapping" : "Create Mapping"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditGraDeptMap;
