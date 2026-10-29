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
  Menu,
  Link as LinkIcon,
  AlertCircle,
  ChevronDown,
  Hash,
  Users,
  CheckCircle,
  Search,
  XCircle,
  Check,
  Filter,
  RefreshCw,
  ChevronDown as ChevronDownIcon,
  Plus,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import DepartmentMenuMappingsApi from "../../../services/departmentmenumappingsapi";

const AddEditDepartmentMenuMappings = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [menus, setMenus] = useState([]);
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [initialLoad, setInitialLoad] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const [checkingExistingMapping, setCheckingExistingMapping] = useState(false);
  const [existingMappingId, setExistingMappingId] = useState(null);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [selectedDepartmentDetails, setSelectedDepartmentDetails] =
    useState(null);

  // Department dropdown states
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);

  // Refs for department dropdown
  const deptDropdownRef = useRef(null);
  const deptSearchRef = useRef(null);
  const deptButtonRef = useRef(null);
  const deptItemRefs = useRef([]);
  const deptListRef = useRef(null);

  const lastClickTimeRef = useRef(0);

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath =
        "/settings/menu-management/branch-menu-mapping/create";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );

      if (currentMenuItem && currentMenuItem.Fnc_Title) {
        setPageTitle(currentMenuItem.Fnc_Title);
      }
    } catch (error) {
      console.error("Error parsing menu details:", error);
    }
  }, []);

  const [formData, setFormData] = useState({
    Dpt_Id: "",
    Fnc_Ids: [],
  });
  const [errors, setErrors] = useState({});

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(event.target)
      ) {
        setIsDeptDropdownOpen(false);
        setDeptHighlightedIndex(-1);
        setDepartmentSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isDeptDropdownOpen && deptSearchRef.current) {
      setTimeout(() => deptSearchRef.current.focus(), 0);
    }
  }, [isDeptDropdownOpen]);

  // Scroll highlighted item into view
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
      console.log("Edit mode detected with ID:", id);
      setIsEditMode(true);
      loadMappingData();
    } else {
      console.log("Create mode detected");
      setIsEditMode(false);
      const queryParams = new URLSearchParams(location.search);
      const deptId = queryParams.get("deptId");
      if (deptId) {
        setFormData((prev) => ({ ...prev, Dpt_Id: deptId }));
        checkExistingMapping(deptId);
      }
    }
  }, [id, location]);

  useEffect(() => {
    if (initialLoad) return;

    let filtered = menus;

    if (menuSearchTerm.trim()) {
      const term = menuSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (menu) =>
          menu.Fnc_Desc?.toLowerCase().includes(term) ||
          menu.Fnc_Title?.toLowerCase().includes(term) ||
          menu.GrCod?.toLowerCase().includes(term) ||
          menu.Menu_Links?.toLowerCase().includes(term),
      );
    }

    if (filterType == "selected") {
      filtered = filtered.filter((menu) =>
        formData.Fnc_Ids.includes(menu.Fnc_Id.toString()),
      );
    } else if (filterType == "unselected") {
      filtered = filtered.filter(
        (menu) => !formData.Fnc_Ids.includes(menu.Fnc_Id.toString()),
      );
    }

    setFilteredMenus(filtered);
  }, [menuSearchTerm, filterType, menus, formData.Fnc_Ids, initialLoad]);

  // Filter departments based on search
  useEffect(() => {
    if (!departments.length) return;

    if (!departmentSearch.trim()) {
      setFilteredDepartments(departments);
    } else {
      const term = departmentSearch.toLowerCase();
      const filtered = departments.filter(
        (dept) =>
          dept.Dpt_Desc?.toLowerCase().includes(term) ||
          dept.Dpt_Name?.toLowerCase().includes(term) ||
          dept.GrCod?.toLowerCase().includes(term) ||
          dept.UpGrp?.toLowerCase().includes(term),
      );
      setFilteredDepartments(filtered);
    }
    setDeptHighlightedIndex(-1);
  }, [departmentSearch, departments]);

  // Focus on department button when loading completes in edit mode
  useEffect(() => {
    if (!loading && isEditMode && deptButtonRef.current) {
      setTimeout(() => deptButtonRef.current.focus(), 100);
    }
  }, [loading, isEditMode]);

  const checkExistingMapping = async (departmentId) => {
    if (!departmentId) return;

    setCheckingExistingMapping(true);
    try {
      const response = await DepartmentMenuMappingsApi.getAll();

      if (response.success && response.data && Array.isArray(response.data)) {
        const existingMapping = response.data.find(
          (mapping) => mapping.Dpt_id?.toString() == departmentId.toString(),
        );

        if (existingMapping) {
          const existingId = existingMapping.DMM_Id;

          setExistingMappingId(existingId);
          setIsEditMode(true);

          await loadExistingMappingData(existingId);

          navigate(
            `/settings/menu-management/branch-menu-mapping/edit/${existingId}`,
            { replace: true },
          );
        } else {
          setFormData((prev) => ({ ...prev, Fnc_Ids: [] }));
        }
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
      const response = await DepartmentMenuMappingsApi.getById(mappingId);
      if (response.success) {
        const mappingData = response.data;

        const fncIds = mappingData.Fnc_Id
          ? mappingData.Fnc_Id.map((id) => id.toString())
          : [];

        const deptId =
          mappingData.Dpt_id?.toString() ||
          mappingData.Dpt_Id?.toString() ||
          "";

        setFormData({
          Dpt_Id: deptId,
          Fnc_Ids: fncIds,
        });

        if (mappingData.department) {
          setSelectedDepartmentDetails(mappingData.department);
        } else {
          const foundDept = departments.find(
            (d) =>
              d.Dpt_id?.toString() == deptId || d.Dpt_Id?.toString() == deptId,
          );
          if (foundDept) {
            setSelectedDepartmentDetails(foundDept);
          }
        }

        setFilterType("selected");
        setIsEditMode(true);
        setExistingMappingId(mappingId);
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
      const [deptResponse, menuResponse] = await Promise.all([
        DepartmentMenuMappingsApi.getDepartments(),
        DepartmentMenuMappingsApi.getMenus(),
      ]);

      if (deptResponse.success) {
        const deptData = deptResponse.data || [];
        setDepartments(deptData);
        setFilteredDepartments(deptData);
      }

      if (menuResponse.status == "success" && menuResponse.data) {
        const menuData = menuResponse.data || [];

        const sortedMenus = menuData.sort((a, b) =>
          a.GrCod.localeCompare(b.GrCod),
        );
        setMenus(sortedMenus);
        setFilteredMenus(sortedMenus);
        setInitialLoad(false);
      } else {
        console.error("Failed to load menus:", menuResponse);
        toast.error("Failed to load menu data");
      }
    } catch (error) {
      console.error("Failed to load dropdowns:", error);
      toast.error("Failed to load dropdown data");
    }
  };

  const loadMappingData = async () => {
    setLoading(true);
    try {
      console.log("Loading mapping data for ID:", id);
      const response = await DepartmentMenuMappingsApi.getById(id);
      console.log("Load mapping response:", response);

      if (response.success) {
        const mappingData = response.data;
        console.log("Mapping data loaded:", mappingData);

        const fncIds = mappingData.Fnc_Id
          ? mappingData.Fnc_Id.map((id) => id.toString())
          : [];

        const deptId =
          mappingData.Dpt_id?.toString() ||
          mappingData.Dpt_Id?.toString() ||
          "";

        setFormData({
          Dpt_Id: deptId,
          Fnc_Ids: fncIds,
        });

        if (mappingData.department) {
          setSelectedDepartmentDetails(mappingData.department);
        } else {
          const foundDept = departments.find(
            (d) =>
              d.Dpt_id?.toString() == deptId || d.Dpt_Id?.toString() == deptId,
          );
          if (foundDept) {
            setSelectedDepartmentDetails(foundDept);
          }
        }

        setFilterType("selected");
        setIsEditMode(true);
        console.log("Edit mode set to:", true);
      } else {
        toast.error("Failed to load mapping data!");
        navigate("/settings/menu-management/branch-menu-mapping");
      }
    } catch (error) {
      console.error("Error loading mapping:", error);
      toast.error("Failed to load mapping data!");
      navigate("/settings/menu-management/branch-menu-mapping");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name == "Dpt_Id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        Fnc_Ids: [],
      }));

      const selectedDept = departments.find(
        (d) => d.Dpt_id?.toString() == value || d.Dpt_Id?.toString() == value,
      );
      setSelectedDepartmentDetails(selectedDept);

      if (value && !isEditMode) {
        checkExistingMapping(value);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Department dropdown handlers
  const handleDeptButtonKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp") {
      e.preventDefault();
      if (!isDeptDropdownOpen) {
        setIsDeptDropdownOpen(true);
        setDepartmentSearch("");
        setDeptHighlightedIndex(0);
      } else {
        if (e.key == "ArrowDown") {
          setDeptHighlightedIndex(0);
        }
      }
    } else if (e.key == "Enter" || e.key == " ") {
      e.preventDefault();
      setIsDeptDropdownOpen(!isDeptDropdownOpen);
      if (!isDeptDropdownOpen) {
        setDepartmentSearch("");
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isDeptDropdownOpen) {
        setIsDeptDropdownOpen(false);
        setDeptHighlightedIndex(-1);
        setDepartmentSearch("");
      }
    }
  };

  const handleDeptSearchKeyDown = (e) => {
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
      setDeptHighlightedIndex(-1);
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (
        deptHighlightedIndex >= 0 &&
        deptHighlightedIndex < filteredDepartments.length
      ) {
        handleDeptSelect(filteredDepartments[deptHighlightedIndex].Dpt_id);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDepartmentSearch("");
      deptButtonRef.current?.focus();
    }
  };

  const handleDeptItemKeyDown = (e, dept, idx) => {
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
      handleDeptSelect(dept.Dpt_id);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDepartmentSearch("");
      deptButtonRef.current?.focus();
    }
  };

  const handleDeptSelect = (deptId) => {
    setFormData((prev) => ({
      ...prev,
      Dpt_Id: deptId.toString(),
      Fnc_Ids: [],
    }));

    const selectedDept = departments.find(
      (d) =>
        d.Dpt_id?.toString() == deptId.toString() ||
        d.Dpt_Id?.toString() == deptId.toString(),
    );
    setSelectedDepartmentDetails(selectedDept);
    setIsDeptDropdownOpen(false);
    setDepartmentSearch("");
    setDeptHighlightedIndex(-1);

    if (errors.Dpt_Id) {
      setErrors((prev) => ({ ...prev, Dpt_Id: null }));
    }

    if (deptId && !isEditMode) {
      checkExistingMapping(deptId);
    }

    setTimeout(() => deptButtonRef.current?.focus(), 100);
  };

  const getDepartmentDisplayName = (dept) => {
    if (!dept) return "";
    const level = parseInt(dept.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const displayName = dept.Dpt_Desc || dept.Dpt_Name || "Unnamed Department";
    return `${indent}${displayName}`;
  };

  const getDeptLevelColor = (level) => {
    const colors = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-green-100 text-green-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-purple-100 text-purple-800",
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  const getSelectedDepartmentDisplay = () => {
    if (!formData.Dpt_Id) return "Select a department *";

    const selected = departments.find(
      (d) =>
        d.Dpt_id?.toString() == formData.Dpt_Id ||
        d.Dpt_Id?.toString() == formData.Dpt_Id,
    );

    if (selected) {
      return getDepartmentDisplayName(selected);
    }

    if (selectedDepartmentDetails) {
      return getDepartmentDisplayName(selectedDepartmentDetails);
    }

    return "Selected department not found";
  };

  const getIndentedMenuNameAndStyle = (menu, depth) => {
    const indentLevels = {
      1: "",
      2: "    ",
      3: "        ",
      4: "            ",
    };

    const level = parseInt(menu.GrStt);
    const displayName = menu.Fnc_Desc || menu.Fnc_Title || "Unnamed Menu";

    const rowStyles = {
      1: "bg-blue-50",
      2: "bg-green-50",
      3: "bg-amber-50",
      4: "bg-purple-50",
    };

    const opacityClass = menu.isvisible == 0 ? "opacity-60" : "";

    return {
      name: `${indentLevels[level] || ""}${displayName}`,
      rowClass: `${rowStyles[level] || "bg-gray-50"} ${opacityClass}`,
      level: level,
    };
  };

  const hasChildren = (menu) => {
    if (menu.GrStt == "4") return false;

    const currentLevel = parseInt(menu.GrStt);
    const nextLevel = currentLevel + 1;

    return menus.some(
      (m) => m.GrStt == nextLevel.toString() && m.UpGrp == menu.GrCod,
    );
  };

  const getChildrenMenus = (parentMenu) => {
    const currentLevel = parseInt(parentMenu.GrStt);
    const nextLevel = currentLevel + 1;

    return menus.filter(
      (m) => m.GrStt == nextLevel.toString() && m.UpGrp == parentMenu.GrCod,
    );
  };

  const getAllDescendants = (menu) => {
    const descendants = [];

    const findDescendants = (parent) => {
      const children = getChildrenMenus(parent);
      descendants.push(...children);
      children.forEach((child) => findDescendants(child));
    };

    findDescendants(menu);
    return descendants;
  };

  const getMenuSelectionStatus = (menu) => {
    const isSelected = formData.Fnc_Ids.includes(menu.Fnc_Id.toString());

    if (isSelected) {
      return "fully-selected";
    }

    const descendants = getAllDescendants(menu);
    const anyDescendantSelected = descendants.some((desc) =>
      formData.Fnc_Ids.includes(desc.Fnc_Id.toString()),
    );

    return anyDescendantSelected ? "partially-selected" : "not-selected";
  };

  const toggleMenuExpand = (menu) => {
    const newExpanded = new Set(expandedMenus);
    if (expandedMenus.has(menu.Fnc_Id)) {
      newExpanded.delete(menu.Fnc_Id);
    } else {
      newExpanded.add(menu.Fnc_Id);
    }
    setExpandedMenus(newExpanded);
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 1:
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-green-100 text-green-800";
      case 3:
        return "bg-amber-100 text-amber-800";
      case 4:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelText = (level) => {
    return `Level ${level}`;
  };

  const handleMenuSelection = (menuId) => {
    const menuIdStr = menuId.toString();
    const menu = menus.find((m) => m.Fnc_Id.toString() == menuIdStr);

    if (!menu) return;

    setFormData((prev) => {
      const currentIds = [...prev.Fnc_Ids];

      if (currentIds.includes(menuIdStr)) {
        let newIds = currentIds.filter((id) => id != menuIdStr);

        const descendants = getAllDescendants(menu);
        const descendantIds = descendants.map((d) => d.Fnc_Id.toString());
        newIds = newIds.filter((id) => !descendantIds.includes(id));

        return {
          ...prev,
          Fnc_Ids: newIds,
        };
      } else {
        let newIds = [...currentIds, menuIdStr];

        const descendants = getAllDescendants(menu);
        const descendantIds = descendants.map((d) => d.Fnc_Id.toString());

        newIds = [...new Set([...newIds, ...descendantIds])];

        return {
          ...prev,
          Fnc_Ids: newIds,
        };
      }
    });

    if (errors.Fnc_Ids) {
      setErrors((prev) => ({ ...prev, Fnc_Ids: null }));
    }
  };

  const handleRowClick = (menuId, e) => {
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

    handleMenuSelection(menuId);
  };

  const handleCheckboxClick = (menuId, e) => {
    if (e) {
      e.stopPropagation();
    }
    handleMenuSelection(menuId);
  };

  const getMenusToDisplay = () => {
    const filtered = filteredMenus;
    const displayMenus = [];

    const addMenuAndDescendants = (menu, depth = 0) => {
      displayMenus.push({ ...menu, depth });

      if (expandedMenus.has(menu.Fnc_Id) && hasChildren(menu)) {
        const children = getChildrenMenus(menu);
        children.forEach((child) => {
          addMenuAndDescendants(child, depth + 1);
        });
      }
    };

    const level1Menus = filtered.filter((m) => m.GrStt == "1");
    level1Menus.forEach((menu) => {
      addMenuAndDescendants(menu);
    });

    return displayMenus;
  };

  const selectAllVisibleMenus = () => {
    const allIds = filteredMenus.map((menu) => menu.Fnc_Id.toString());
    setFormData((prev) => ({
      ...prev,
      Fnc_Ids: [...new Set([...prev.Fnc_Ids, ...allIds])],
    }));
  };

  const deselectAllVisibleMenus = () => {
    const visibleIds = filteredMenus.map((menu) => menu.Fnc_Id.toString());
    setFormData((prev) => ({
      ...prev,
      Fnc_Ids: prev.Fnc_Ids.filter((id) => !visibleIds.includes(id)),
    }));
  };

  const deselectAllMenus = () => {
    setFormData((prev) => ({
      ...prev,
      Fnc_Ids: [],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Dpt_Id) {
      newErrors.Dpt_Id = "Department is required";
    }

    if (formData.Fnc_Ids.length == 0) {
      newErrors.Fnc_Ids = "At least one menu must be selected";
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
      Dpt_Id: parseInt(formData.Dpt_Id),
      Fnc_Id: formData.Fnc_Ids.map((id) => parseInt(id)),
    };

    const selectedDepartment =
      departments.find(
        (dept) =>
          dept.Dpt_id?.toString() == formData.Dpt_Id ||
          dept.Dpt_Id?.toString() == formData.Dpt_Id,
      ) || selectedDepartmentDetails;
    const selectedMenus = menus.filter((menu) =>
      formData.Fnc_Ids.includes(menu.Fnc_Id.toString()),
    );

    const result = await Swal.fire({
      title: isEditMode ? "Update Mapping?" : "Create New Mapping?",
      html: `
        <div class="text-left">
          <p class="mb-2">${isEditMode ? "Update this department-menu mapping?" : "Create a new department-menu mapping?"}</p>
          <p class="text-sm text-gray-600 mb-1"><strong>Department:</strong> ${selectedDepartment?.Dpt_Desc || selectedDepartment?.Dpt_Name || "Not selected"}</p>
          <p class="text-sm text-gray-600 mb-2"><strong>Selected Menus:</strong> ${selectedMenus.length} menu(s)</p>
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

        response = await DepartmentMenuMappingsApi.update(
          mappingId,
          submitData,
        );
        toast.success("Mapping updated successfully!");
      } else {
        response = await DepartmentMenuMappingsApi.create(submitData);
        toast.success("Mapping created successfully!");
      }

      setTimeout(() => {
        navigate("/settings/menu-management/branch-menu-mapping");
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
    navigate("/settings/menu-management/branch-menu-mapping");
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
    if (!formData.Dpt_Id) return null;

    const found = departments.find(
      (d) =>
        d.Dpt_id?.toString() == formData.Dpt_Id ||
        d.Dpt_Id?.toString() == formData.Dpt_Id,
    );

    return found || selectedDepartmentDetails;
  };

  const getSelectedMenus = () => {
    return menus.filter((menu) =>
      formData.Fnc_Ids.includes(menu.Fnc_Id.toString()),
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading mapping data...</p>
      </div>
    );
  }

  const menusToDisplay = getMenusToDisplay();
  const totalMenus = menus.length;
  const selectedMenusCount = formData.Fnc_Ids.length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/settings/menu-management/branch-menu-mapping")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {pageTitle ||
                (isEditMode
                  ? "Edit Department-Menu Mapping"
                  : "Add New Department-Menu Mapping")}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update department-menu mapping information"
                : "Create a new mapping between department and menus"}
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
              <LinkIcon className="h-4 w-4 text-white" />
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
                  ref={deptButtonRef}
                  type="button"
                  onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                  onKeyDown={handleDeptButtonKeyDown}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Dpt_Id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white`}
                >
                  <span
                    className={
                      formData.Dpt_Id ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {formData.Dpt_Id
                      ? getSelectedDepartmentDisplay()
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
                {errors.Dpt_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {errors.Dpt_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Dpt_Id}
                </p>
              )}

              {/* Department Dropdown Menu */}
              {isDeptDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={deptSearchRef}
                        type="text"
                        value={departmentSearch}
                        onChange={(e) => setDepartmentSearch(e.target.value)}
                        onKeyDown={handleDeptSearchKeyDown}
                        placeholder="Search departments by name, description, code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        autoFocus
                      />
                      {departmentSearch && (
                        <button
                          type="button"
                          onClick={() => setDepartmentSearch("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div ref={deptListRef} className="overflow-y-auto max-h-64">
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((dept, idx) => {
                        const isSelected =
                          formData.Dpt_Id == dept.Dpt_id?.toString() ||
                          formData.Dpt_Id == dept.Dpt_Id?.toString();
                        const level = parseInt(dept.GrStt, 10) || 1;

                        return (
                          <button
                            key={dept.Dpt_id || dept.Dpt_Id}
                            ref={(el) => {
                              deptItemRefs.current[idx] = el;
                            }}
                            type="button"
                            onClick={() =>
                              handleDeptSelect(dept.Dpt_id || dept.Dpt_Id)
                            }
                            onKeyDown={(e) =>
                              handleDeptItemKeyDown(e, dept, idx)
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
                                className={`h-6 w-6 rounded flex items-center justify-center mr-3 ${
                                  level == 1
                                    ? "bg-blue-100 text-blue-600"
                                    : level == 2
                                      ? "bg-green-100 text-green-600"
                                      : level == 3
                                        ? "bg-amber-100 text-amber-600"
                                        : "bg-purple-100 text-purple-600"
                                }`}
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
                        {departmentSearch && (
                          <p className="text-xs mt-1">
                            Try a different search term
                          </p>
                        )}
                      </div>
                    )}
                  </div>

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
                  : "Select department to map with multiple menus"}
              </p>
            </div>

            {/* Menus Section */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Menus <span className="text-red-500">*</span>
                </label>
                <div className="text-xs text-gray-500">
                  Total: {totalMenus} | Selected: {selectedMenusCount} |
                  Showing: {filteredMenus.length}
                </div>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menus by name, description"
                  value={menuSearchTerm}
                  onChange={(e) => setMenuSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {menuSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setMenuSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center ${
                      filterType == "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    All ({totalMenus})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("selected")}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center ${
                      filterType == "selected"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Selected ({selectedMenusCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("unselected")}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center ${
                      filterType == "unselected"
                        ? "bg-gray-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Unselected ({totalMenus - selectedMenusCount})
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllMenus}
                    className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Clear All
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllVisibleMenus}
                    className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Select Visible
                  </button>
                </div>
              </div>

              <div
                className={`border rounded-lg overflow-hidden ${
                  errors.Fnc_Ids ? "border-red-300" : "border-gray-300"
                }`}
              >
                <div className="max-h-96 overflow-y-auto">
                  {filteredMenus.length == 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Menu className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No menus found matching your criteria</p>
                      {(menuSearchTerm || filterType != "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuSearchTerm("");
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
                                filteredMenus.length > 0 &&
                                filteredMenus.every((menu) =>
                                  formData.Fnc_Ids.includes(
                                    menu.Fnc_Id.toString(),
                                  ),
                                )
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  selectAllVisibleMenus();
                                } else {
                                  deselectAllVisibleMenus();
                                }
                              }}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            MENU DETAILS
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            CODE & LEVEL
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            STATUS
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {menusToDisplay.map((menu) => {
                          const isSelected = formData.Fnc_Ids.includes(
                            menu.Fnc_Id.toString(),
                          );
                          const hasChildrenMenus = hasChildren(menu);
                          const isExpanded = expandedMenus.has(menu.Fnc_Id);
                          const selectionStatus = getMenuSelectionStatus(menu);
                          const { name, rowClass, level } =
                            getIndentedMenuNameAndStyle(menu, menu.depth);

                          return (
                            <tr
                              key={menu.Fnc_Id}
                              className={`hover:bg-gray-50 transition-colors cursor-pointer ${rowClass} ${
                                isSelected
                                  ? "border-l-4 border-blue-500"
                                  : selectionStatus == "partially-selected"
                                    ? "border-l-4 border-indigo-300"
                                    : ""
                              }`}
                              onClick={(e) => handleRowClick(menu.Fnc_Id, e)}
                              onDoubleClick={(e) => e.preventDefault()}
                            >
                              <td
                                className="px-4 py-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center gap-2">
                                  {hasChildrenMenus && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMenuExpand(menu);
                                      }}
                                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                      {isExpanded ? (
                                        <Minus className="h-3 w-3 text-gray-600" />
                                      ) : (
                                        <Plus className="h-3 w-3 text-gray-600" />
                                      )}
                                    </button>
                                  )}
                                  <div className="flex items-center h-5">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      ref={(el) => {
                                        if (el) {
                                          if (
                                            selectionStatus ===
                                            "partially-selected"
                                          ) {
                                            el.indeterminate = true;
                                          } else {
                                            el.indeterminate = false;
                                          }
                                        }
                                      }}
                                      onChange={(e) =>
                                        handleCheckboxClick(menu.Fnc_Id, e)
                                      }
                                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                      id={`menu-checkbox-${menu.Fnc_Id}`}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div
                                    className={`h-6 w-6 rounded flex items-center justify-center mr-3 ${
                                      level == 1
                                        ? "bg-blue-100 text-blue-600"
                                        : level == 2
                                          ? "bg-green-100 text-green-600"
                                          : level == 3
                                            ? "bg-amber-100 text-amber-600"
                                            : "bg-purple-100 text-purple-600"
                                    }`}
                                  >
                                    <span className="text-xs font-bold">
                                      L{level}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 flex items-center">
                                      <span
                                        style={{
                                          marginLeft: `${menu.depth * 20}px`,
                                        }}
                                      >
                                        {name}
                                      </span>
                                      {selectionStatus ===
                                        "partially-selected" && (
                                        <span className="ml-2 inline-flex items-center text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                                          <Check className="h-3 w-3 mr-1" />
                                          Partial
                                        </span>
                                      )}
                                      {isSelected && (
                                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500"></span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {menu.Menu_Links || "No link"}
                                      {menu.isvisible == 0 && (
                                        <span className="ml-2 italic">
                                          (Hidden)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <Hash className="h-3 w-3 text-gray-400 mr-1" />
                                    <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                                      {menu.GrCod}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded ${getLevelBadgeClass(
                                        level,
                                      )}`}
                                    >
                                      {getLevelText(level)}
                                    </span>
                                    {menu.UpGrp && menu.UpGrp != menu.GrCod && (
                                      <span className="ml-2 text-xs text-gray-500">
                                        Parent: {menu.UpGrp}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    menu.isvisible
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {menu.isvisible ? (
                                    <>
                                      <Eye className="h-3 w-3 mr-1" />
                                      Visible
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="h-3 w-3 mr-1" />
                                      Hidden
                                    </>
                                  )}
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
              {errors.Fnc_Ids && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Fnc_Ids}
                </p>
              )}
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">
                    Click anywhere on a row to select/unselect.
                  </span>
                  <span className="ml-2">✓ Fully selected</span>
                  <span className="ml-2 text-indigo-600">
                    ▢ Partially selected (child selected)
                  </span>
                </p>
                <span className="text-xs text-gray-500">
                  Filter:{" "}
                  {filterType == "all"
                    ? "All"
                    : filterType == "selected"
                      ? "Selected"
                      : "Unselected"}{" "}
                  • Showing: {filteredMenus.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            {formData.Dpt_Id && (
              <div className="mt-1">
                <p className="text-xs text-gray-500">
                  {isEditMode ? "Updating" : "Creating"} mapping for{" "}
                  <span className="font-medium">
                    {getSelectedDepartment()?.Dpt_Desc ||
                      getSelectedDepartment()?.Dpt_Name ||
                      "selected department"}
                  </span>{" "}
                  and {selectedMenusCount} menu(s)
                </p>
                {existingMappingId && (
                  <p className="text-xs text-green-600 mt-0.5">
                    <CheckCircle className="h-3 w-3 inline mr-1" />
                    Editing existing mapping #{existingMappingId}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                saving ||
                !formData.Dpt_Id ||
                formData.Fnc_Ids.length == 0 ||
                checkingExistingMapping
              }
              className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all shadow-sm ${
                saving ||
                !formData.Dpt_Id ||
                formData.Fnc_Ids.length == 0 ||
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

export default AddEditDepartmentMenuMappings;
