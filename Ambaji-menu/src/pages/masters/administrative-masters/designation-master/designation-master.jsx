import React, { useState, useEffect, useRef } from "react";
import {
  FolderTree,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  XCircle,
  CheckCircle,
  ArrowLeft,
  Eye as EyeVisible,
  EyeOff,
  Globe,
  Search,
  ChevronDown,
  XCircle as XCircleIcon,
  Check,
  AlertCircle,
  Loader,
  Building2,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function DesignationMaster() {
  const navigate = useNavigate();
  const [functionTypes, setFunctionTypes] = useState([]);
  const [allFunctionTypes, setAllFunctionTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const [editFunctionType, setEditFunctionType] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [loadingState, setLoadingState] = useState({
    initialFetch: true,
    addFunctionType: false,
    updateFunctionType: false,
    deleteFunctionType: false,
    filterFunctionType: false,
    toggleVisibility: false,
    fetchDepartments: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [formError, setFormError] = useState(null);
  const [pageTitle, setPageTitle] = useState("Designation Master");

  // =============  PARENT DESIGNATION DROPDOWN STATES ==============
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const [parentSearchTerm, setParentSearchTerm] = useState("");
  const [filteredParentDesignations, setFilteredParentDesignations] = useState(
    [],
  );
  const [parentHighlightedIndex, setParentHighlightedIndex] = useState(-1);
  const [selectedParentId, setSelectedParentId] = useState("");

  // =============  DEPARTMENT DROPDOWN STATES (MULTIPLE SELECTION) ==============
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);
  const [selectedDeptIds, setSelectedDeptIds] = useState([]);

  // Refs for dropdowns
  const parentDropdownRef = useRef(null);
  const parentSearchRef = useRef(null);
  const parentButtonRef = useRef(null);
  const parentItemRefs = useRef([]);

  const deptDropdownRef = useRef(null);
  const deptSearchRef = useRef(null);
  const deptButtonRef = useRef(null);
  const deptItemRefs = useRef([]);
  const deptListRef = useRef(null);

  // =============  HELPER FUNCTION TO PARSE DEPARTMENT IDS ==============
  const parseDepartmentIds = (dptId) => {
    if (!dptId) return [];
    if (Array.isArray(dptId)) return dptId.map((id) => id.toString());
    if (typeof dptId == "string")
      return dptId
        .split(",")
        .filter(Boolean)
        .map((id) => id.trim());
    // If it's a number or single value, convert to array with one item
    return [dptId.toString()];
  };

  // Load page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );

      const currentPath = "/masters/administrative-masters/designation-master";

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

  // =============  FETCH DEPARTMENTS ==============
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingState((prev) => ({ ...prev, fetchDepartments: true }));
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
          {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
        );

        if (response.data.success && response.data.data) {
          const deptsData = response.data.data;
          // Sort departments by GrCod for hierarchical display
          const sortedDepts = deptsData.sort((a, b) =>
            (a.GrCod || "").localeCompare(b.GrCod || ""),
          );
          setDepartments(sortedDepts);
          setFilteredDepartments(sortedDepts);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Failed to load departments");
      } finally {
        setLoadingState((prev) => ({ ...prev, fetchDepartments: false }));
      }
    };

    fetchDepartments();
  }, []);

  // =============  CLICK OUTSIDE HANDLER FOR PARENT DROPDOWN ==============
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        parentDropdownRef.current &&
        !parentDropdownRef.current.contains(event.target)
      ) {
        setIsParentDropdownOpen(false);
        setParentHighlightedIndex(-1);
        setParentSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =============  CLICK OUTSIDE HANDLER FOR DEPARTMENT DROPDOWN ==============
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

  // =============  FOCUS SEARCH WHEN DROPDOWN OPENS ==============
  useEffect(() => {
    if (isParentDropdownOpen && parentSearchRef.current) {
      setTimeout(() => parentSearchRef.current.focus(), 0);
    }
  }, [isParentDropdownOpen]);

  useEffect(() => {
    if (isDeptDropdownOpen && deptSearchRef.current) {
      setTimeout(() => deptSearchRef.current.focus(), 0);
    }
  }, [isDeptDropdownOpen]);

  // =============  SCROLL HIGHLIGHTED ITEM INTO VIEW ==============
  useEffect(() => {
    if (
      isParentDropdownOpen &&
      parentHighlightedIndex >= 0 &&
      parentItemRefs.current[parentHighlightedIndex]
    ) {
      parentItemRefs.current[parentHighlightedIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [parentHighlightedIndex, isParentDropdownOpen]);

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

  // =============  FILTER PARENT DESIGNATIONS ==============
  useEffect(() => {
    if (!allFunctionTypes.length) return;

    if (!parentSearchTerm.trim()) {
      const sorted = [...allFunctionTypes].sort((a, b) =>
        (a.GrCod || "").localeCompare(b.GrCod || ""),
      );
      setFilteredParentDesignations(sorted);
    } else {
      const term = parentSearchTerm.toLowerCase();
      const filtered = allFunctionTypes.filter(
        (desg) =>
          (desg.Dsg_Desc?.toLowerCase() || "").includes(term) ||
          (desg.Dsg_EName?.toLowerCase() || "").includes(term) ||
          (desg.GrCod?.toLowerCase() || "").includes(term),
      );
      setFilteredParentDesignations(
        filtered.sort((a, b) => (a.GrCod || "").localeCompare(b.GrCod || "")),
      );
    }
    setParentHighlightedIndex(-1);
  }, [parentSearchTerm, allFunctionTypes]);

  // =============  FILTER DEPARTMENTS ==============
  useEffect(() => {
    if (!departments.length) return;

    if (!deptSearchTerm.trim()) {
      setFilteredDepartments(departments);
    } else {
      const term = deptSearchTerm.toLowerCase();
      const filtered = departments.filter(
        (dept) =>
          (dept.Dpt_Desc?.toLowerCase() || "").includes(term) ||
          (dept.Dpt_Name?.toLowerCase() || "").includes(term),
      );
      setFilteredDepartments(filtered);
    }
    setDeptHighlightedIndex(-1);
  }, [deptSearchTerm, departments]);

  // =============  FOCUS ON BUTTONS WHEN MODAL OPENS ==============
  useEffect(() => {
    if (showForm) {
      const timer = setTimeout(() => {
        if (deptButtonRef.current) {
          deptButtonRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showForm]);

  // =============  FOCUS ON HIGHLIGHTED ITEM ==============
  useEffect(() => {
    if (isParentDropdownOpen && parentHighlightedIndex >= 0) {
      setTimeout(() => {
        if (parentItemRefs.current[parentHighlightedIndex]) {
          parentItemRefs.current[parentHighlightedIndex].focus();
        }
      }, 50);
    }
  }, [parentHighlightedIndex, isParentDropdownOpen]);

  useEffect(() => {
    if (isDeptDropdownOpen && deptHighlightedIndex >= 0) {
      setTimeout(() => {
        if (deptItemRefs.current[deptHighlightedIndex]) {
          deptItemRefs.current[deptHighlightedIndex].focus();
        }
      }, 50);
    }
  }, [deptHighlightedIndex, isDeptDropdownOpen]);

  const isLoading = Object.values(loadingState).some((state) => state);

  // Get the next group code based on parent function
  const getNextGroupCode = (parentFunction) => {
    if (!parentFunction) {
      // Level 1 item - find next available XX000000000000000000 format
      const level1Items = allFunctionTypes.filter(
        (ft) => ft.GrStt == "1" || !ft.UpGrp,
      );
      const maxCode = level1Items.reduce((max, item) => {
        const codeNum = parseInt(item.GrCod?.substring(0, 2), 10) || 0;
        return codeNum > max ? codeNum : max;
      }, 0);
      const nextCode = (maxCode + 1).toString().padStart(2, "0");
      return {
        GrCod: `${nextCode}${"0".repeat(18)}`, // 2 + 18 zeros = 20 characters
        GrSrn: (level1Items.length + 1).toString(),
        GrStt: "1",
        UpGrp: null,
        isvisible: 1,
      };
    }

    const parentGrsh = parseInt(parentFunction.GrStt, 10);

    // For levels 2-10, we need to find the appropriate position
    if (parentGrsh >= 1 && parentGrsh <= 9) {
      // Determine the position in the 20-character string (10 pairs)
      const pairStartIndex = parentGrsh * 2; // Each level occupies 2 characters

      // Get parent's prefix up to this level
      const parentPrefix = parentFunction.GrCod.substring(0, pairStartIndex);

      // Find siblings at the same level with same parent prefix
      const siblings = allFunctionTypes.filter((ft) => {
        if (parseInt(ft.GrStt, 10) != parentGrsh + 1) return false;

        // Check if it's under the same parent hierarchy (should match parent's code up to parent level)
        return ft.GrCod?.substring(0, pairStartIndex) == parentPrefix;
      });

      // Find max value for this level pair
      let maxSibling = 0;
      siblings.forEach((item) => {
        const pairValue =
          parseInt(
            item.GrCod?.substring(pairStartIndex, pairStartIndex + 2),
            10,
          ) || 0;
        if (pairValue > maxSibling) {
          maxSibling = pairValue;
        }
      });

      const nextNum = maxSibling + 1;
      const nextPair = nextNum.toString().padStart(2, "0");

      // Build the new code: parent prefix + next pair + zeros for remaining positions
      let newCode = parentPrefix + nextPair;
      // Fill remaining positions with zeros to make it 20 characters
      while (newCode.length < 20) {
        newCode += "0";
      }

      return {
        GrCod: newCode,
        GrSrn: (siblings.length + 1).toString(),
        GrStt: (parentGrsh + 1).toString(),
        UpGrp: parentFunction.Dsg_id,
        isvisible: 1,
      };
    }

    // Level 10 or higher - shouldn't normally happen
    return {
      GrCod: parentFunction.GrCod,
      GrSrn: "1",
      GrStt: "10",
      UpGrp: parentFunction.Dsg_id,
      isvisible: 1,
    };
  };

  // Helper function to check if an item is a child of another
  const isChildOf = (child, parent) => {
    if (!parent || !child) return false;

    const parentLevel = parseInt(parent.GrStt, 10);
    const childLevel = parseInt(child.GrStt, 10);

    if (childLevel != parentLevel + 1) return false;

    // Check if child code starts with parent's code up to parent level * 2 characters
    const charsToMatch = parentLevel * 2;
    return (
      child.GrCod?.substring(0, charsToMatch) ===
      parent.GrCod?.substring(0, charsToMatch)
    );
  };

  // Get children of a parent item
  const getChildren = (parent) => {
    return functionTypes.filter((ft) => isChildOf(ft, parent));
  };

  // Check if item has children
  const hasChildren = (functionType) => {
    const currentLevel = parseInt(functionType.GrStt, 10);
    if (currentLevel >= 10) return false;

    return functionTypes.some((ft) => isChildOf(ft, functionType));
  };

  // Get filtered function types for display
  const getFilteredFunctionTypes = () => {
    if (expandedItems.size == 0) {
      return functionTypes.filter((ft) => ft.GrStt == "1");
    }

    const visibleItems = [];

    // Recursive function to add visible items
    const addVisibleItems = (parent, level) => {
      visibleItems.push(parent);

      if (expandedItems.has(parent.Dsg_id) && level < 10) {
        const children = getChildren(parent);
        children.forEach((child) => {
          addVisibleItems(child, level + 1);
        });
      }
    };

    // Start with level 1 items
    const level1Items = functionTypes.filter((ft) => ft.GrStt == "1");
    level1Items.forEach((item) => {
      addVisibleItems(item, 1);
    });

    return visibleItems.sort((a, b) =>
      (a.GrCod || "").localeCompare(b.GrCod || ""),
    );
  };

  const filteredFunctionTypes = getFilteredFunctionTypes();

  // =============  DEPARTMENT DISPLAY FUNCTIONS ==============

  // Get department display name for dropdown - shows Dpt_Desc with Dpt_Name below (with indentation)
  const getDepartmentDisplayName = (dept) => {
    if (!dept) return "";
    const level = parseInt(dept.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = dept.Dpt_Desc || "No Description";
    const name = dept.Dpt_Name;

    return {
      primary: `${indent}${desc}`,
      secondary: name ? `${indent}${name}` : null,
      level: level,
    };
  };

  // Get selected departments display for button
  const getSelectedDeptDisplay = () => {
    if (!selectedDeptIds.length) return "Select Departments (Optional)";
    if (selectedDeptIds.length == 1) {
      const selected = departments.find(
        (d) => d.Dpt_id?.toString() == selectedDeptIds[0],
      );
      if (!selected) return "Selected department not found";

      const level = parseInt(selected.GrStt, 10) || 1;
      const indent = "    ".repeat(level - 1);
      const desc = selected.Dpt_Desc || "No Description";
      const name = selected.Dpt_Name;

      return name ? `${indent}${desc} (${name})` : `${indent}${desc}`;
    }
    return `${selectedDeptIds.length} departments selected`;
  };

  // Get department names for display in table - with proper formatting
  const getDepartmentName = (deptIds) => {
    if (!deptIds || !deptIds.length) return null;

    // Ensure deptIds is an array
    const ids = Array.isArray(deptIds) ? deptIds : [deptIds];
    const deptList = ids
      .map((id) =>
        departments.find((d) => d.Dpt_id?.toString() == id?.toString()),
      )
      .filter(Boolean);

    if (deptList.length == 0) return null;

    return deptList.map((dept) => {
      const level = parseInt(dept.GrStt, 10) || 1;
      const indent = "    ".repeat(level - 1);
      const desc = dept.Dpt_Desc || "No Description";
      const name = dept.Dpt_Name;

      return {
        primary: `${indent}${desc}`,
        secondary: name ? `${indent}${name}` : null,
        level: level,
        id: dept.Dpt_id,
      };
    });
  };

  // Check if a department is selected
  const isDeptSelected = (deptId) => {
    return selectedDeptIds.includes(deptId?.toString());
  };

  // Toggle department selection
  const toggleDeptSelection = (deptId) => {
    const idStr = deptId?.toString();
    setSelectedDeptIds((prev) => {
      if (prev.includes(idStr)) {
        return prev.filter((id) => id != idStr);
      } else {
        return [...prev, idStr];
      }
    });
  };

  // Clear all selected departments
  const clearSelectedDepts = () => {
    setSelectedDeptIds([]);
  };

  // Remove a specific department
  const removeSelectedDept = (deptId) => {
    setSelectedDeptIds((prev) => prev.filter((id) => id != deptId?.toString()));
  };

  // Statistics for L1-L10
  const stats = {
    total: functionTypes.length,
    level1: functionTypes.filter((ft) => ft.GrStt == "1").length,
    level2: functionTypes.filter((ft) => ft.GrStt == "2").length,
    level3: functionTypes.filter((ft) => ft.GrStt == "3").length,
    level4: functionTypes.filter((ft) => ft.GrStt == "4").length,
    level5: functionTypes.filter((ft) => ft.GrStt == "5").length,
    level6: functionTypes.filter((ft) => ft.GrStt == "6").length,
    level7: functionTypes.filter((ft) => ft.GrStt == "7").length,
    level8: functionTypes.filter((ft) => ft.GrStt == "8").length,
    level9: functionTypes.filter((ft) => ft.GrStt == "9").length,
    level10: functionTypes.filter((ft) => ft.GrStt == "10").length,
    visible: functionTypes.filter((ft) => ft.isvisible == 1).length,
    hidden: functionTypes.filter((ft) => ft.isvisible == 0).length,
  };

  const toggleExpand = (functionType) => {
    const newExpandedItems = new Set(expandedItems);
    if (expandedItems.has(functionType.Dsg_id)) {
      newExpandedItems.delete(functionType.Dsg_id);
    } else {
      newExpandedItems.add(functionType.Dsg_id);
    }
    setExpandedItems(newExpandedItems);
  };

  const getIndentedGroupNameAndStyle = (functionType) => {
    const level = parseInt(functionType.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);

    const rowStyles = {
      1: "bg-blue-50",
      2: "bg-green-50",
      3: "bg-yellow-50",
      4: "bg-purple-50",
      5: "bg-pink-50",
      6: "bg-indigo-50",
      7: "bg-orange-50",
      8: "bg-teal-50",
      9: "bg-cyan-50",
      10: "bg-rose-50",
    };

    const opacityClass = functionType.isvisible == 0 ? "opacity-60" : "";

    return {
      name: `${indent}${functionType.Dsg_Desc || ""}`,
      rowClass: `${rowStyles[level] || "bg-gray-50"} ${opacityClass}`,
      level: level,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingState((prev) => ({ ...prev, initialFetch: true }));
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/designation/all`,
          {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
        );

        const funcTypesData = response.data.data || response.data;
        const sortedFuncTypes = Array.isArray(funcTypesData)
          ? funcTypesData.sort((a, b) =>
              (a.GrCod || "").localeCompare(b.GrCod || ""),
            )
          : [];

        setAllFunctionTypes(sortedFuncTypes);
        setFunctionTypes(sortedFuncTypes);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoadingState((prev) => ({ ...prev, initialFetch: false }));
      }
    };
    fetchData();
  }, []);

  // =============  PARENT DROPDOWN KEYBOARD NAVIGATION ==============
  const handleParentSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredParentDesignations.length > 0) {
        setParentHighlightedIndex(0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (parentHighlightedIndex == -1) {
        // Already in search, do nothing
      } else {
        setParentHighlightedIndex(-1);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (
        parentHighlightedIndex >= 0 &&
        parentHighlightedIndex < filteredParentDesignations.length
      ) {
        const selectedItem = filteredParentDesignations[parentHighlightedIndex];
        handleParentSelect(selectedItem.Dsg_id);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsParentDropdownOpen(false);
      setParentHighlightedIndex(-1);
      setParentSearchTerm("");
      parentButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsParentDropdownOpen(false);
    }
  };

  const handleParentItemKeyDown = (e, desig, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredParentDesignations.length) {
        setParentHighlightedIndex(nextIndex);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setParentHighlightedIndex(-1);
        setTimeout(() => parentSearchRef.current?.focus(), 0);
      } else {
        setParentHighlightedIndex(idx - 1);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleParentSelect(desig.Dsg_id);
    }
  };

  const handleParentButtonKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp") {
      e.preventDefault();
      if (!isParentDropdownOpen) {
        setIsParentDropdownOpen(true);
        setParentSearchTerm("");
        setParentHighlightedIndex(0);
      } else {
        if (e.key == "ArrowDown") {
          setParentHighlightedIndex(0);
        }
      }
    } else if (e.key == "Enter" || e.key == " ") {
      e.preventDefault();
      setIsParentDropdownOpen(!isParentDropdownOpen);
      if (!isParentDropdownOpen) {
        setParentSearchTerm("");
        setParentHighlightedIndex(-1);
        setTimeout(() => parentSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isParentDropdownOpen) {
        setIsParentDropdownOpen(false);
        setParentHighlightedIndex(-1);
        setParentSearchTerm("");
      }
    }
  };

  // =============  DEPARTMENT DROPDOWN KEYBOARD NAVIGATION ==============
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
        const selectedItem = filteredDepartments[deptHighlightedIndex];
        toggleDeptSelection(selectedItem.Dpt_id);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      deptButtonRef.current?.focus();
    } else if (e.key == "Tab") {
      setIsDeptDropdownOpen(false);
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
      toggleDeptSelection(dept.Dpt_id);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      deptButtonRef.current?.focus();
    }
  };

  const handleDeptButtonKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp") {
      e.preventDefault();
      if (!isDeptDropdownOpen) {
        setIsDeptDropdownOpen(true);
        setDeptSearchTerm("");
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
        setDeptSearchTerm("");
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isDeptDropdownOpen) {
        setIsDeptDropdownOpen(false);
        setDeptHighlightedIndex(-1);
        setDeptSearchTerm("");
      }
    }
  };

  // =============  PARENT SELECTION HANDLER ==============
  const handleParentSelect = (designationId) => {
    setSelectedParentId(designationId ? designationId.toString() : "");
    setIsParentDropdownOpen(false);
    setParentSearchTerm("");
    setParentHighlightedIndex(-1);

    // Focus on department field after selection
    setTimeout(() => {
      deptButtonRef.current?.focus();
    }, 100);
  };

  const getParentDisplayName = (designation) => {
    if (!designation) return "";
    const level = parseInt(designation.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    return `${indent}${designation.Dsg_Desc || ""} (Level ${level})`;
  };

  const getSelectedParentDisplay = () => {
    if (!selectedParentId) return "Select Parent Designation";
    const selected = allFunctionTypes.find(
      (d) => d.Dsg_id?.toString() == selectedParentId,
    );
    return selected
      ? getParentDisplayName(selected)
      : "Selected designation not found";
  };

  const handleAddFunctionType = async (e) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const Dsg_Desc = formData.get("Dsg_Desc");
    const Dsg_EName = formData.get("Dsg_EName");
    const isvisible = 1;

    if (!Dsg_Desc) {
      setFormError("Description is required.");
      return;
    }

    try {
      setLoadingState((prev) => ({ ...prev, addFunctionType: true }));

      const parentFunction = allFunctionTypes.find(
        (ft) => ft.Dsg_id == selectedParentId,
      );
      const newGroupCode = getNextGroupCode(parentFunction);

      // Handle multiple departments - ALWAYS send as array of strings
      let Dpt_id = [];
      if (selectedDeptIds.length > 0) {
        Dpt_id = selectedDeptIds.map((id) => id.toString());
      }

      const newFunctionType = {
        Dsg_Desc,
        Dsg_EName: Dsg_EName || null,
        Dpt_id: Dpt_id,
        UpGrp: selectedParentId || null,
        GrCod: newGroupCode.GrCod,
        GrSrn: newGroupCode.GrSrn,
        GrStt: newGroupCode.GrStt,
        isvisible: isvisible,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/designation`,
        newFunctionType,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      if (response.data.status == "success") {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/designation/all`,
          {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
        );
        const funcTypesData = refreshResponse.data.data || refreshResponse.data;
        const sortedData = Array.isArray(funcTypesData)
          ? funcTypesData.sort((a, b) =>
              (a.GrCod || "").localeCompare(b.GrCod || ""),
            )
          : [];

        setAllFunctionTypes(sortedData);
        setFunctionTypes(sortedData);

        setShowForm(false);
        setSelectedParentId("");
        setSelectedDeptIds([]);
        setFormError(null);
        toast.success("Designation added successfully!");
      } else {
        setFormError(response.data.message || "Failed to add designation.");
      }
    } catch (error) {
      console.error("Error adding designation:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to add designation. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, addFunctionType: false }));
    }
  };

  const handleEdit = (functionType) => {
    setEditFunctionType(functionType);
    // Parse department IDs using the helper function
    const deptIds = parseDepartmentIds(functionType.Dpt_id);
    setSelectedDeptIds(deptIds);
    setShowEditForm(functionType.Dsg_id);
    setFormError(null);
  };

  const handleUpdateFunctionType = async (e) => {
    e.preventDefault();
    if (!editFunctionType) return;

    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const Dsg_Desc = formData.get("Dsg_Desc");
    const Dsg_EName = formData.get("Dsg_EName");
    const isvisible = formData.get("isvisible") == "on" ? 1 : 0;

    if (!Dsg_Desc) {
      setFormError("Description is required.");
      return;
    }

    // Handle multiple departments - ALWAYS send as array of strings
    let Dpt_id = [];
    if (selectedDeptIds.length > 0) {
      Dpt_id = selectedDeptIds.map((id) => id.toString());
    }

    const updatedFunctionType = {
      Dsg_Desc: Dsg_Desc || editFunctionType.Dsg_Desc,
      Dsg_EName: Dsg_EName == "" ? null : Dsg_EName,
      Dpt_id: Dpt_id,
      UpGrp: editFunctionType.UpGrp,
      GrCod: editFunctionType.GrCod,
      GrSrn: editFunctionType.GrSrn,
      GrStt: editFunctionType.GrStt,
      isvisible: isvisible,
    };

    try {
      setLoadingState((prev) => ({ ...prev, updateFunctionType: true }));
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/designation/${editFunctionType.Dsg_id}`,
        updatedFunctionType,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      if (response.data.status == "success") {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/designation/all`,
          {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
        );
        const funcTypesData = refreshResponse.data.data || refreshResponse.data;
        const sortedData = Array.isArray(funcTypesData)
          ? funcTypesData.sort((a, b) =>
              (a.GrCod || "").localeCompare(b.GrCod || ""),
            )
          : [];

        setAllFunctionTypes(sortedData);
        setFunctionTypes(sortedData);

        setShowEditForm(null);
        setEditFunctionType(null);
        setSelectedDeptIds([]);
        setFormError(null);
        toast.success("Designation updated successfully!");
      } else {
        setFormError(response.data.message || "Failed to update designation.");
      }
    } catch (error) {
      console.error("Error updating designation:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to update designation. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, updateFunctionType: false }));
    }
  };

  const handleDeleteFunctionType = async (Dsg_id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      setLoadingState((prev) => ({ ...prev, deleteFunctionType: true }));
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/designation/${Dsg_id}`,
          {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      if (response.data.status == "success") {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/designation/all`,
              {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
        );
        const funcTypesData = refreshResponse.data.data || refreshResponse.data;
        const sortedData = Array.isArray(funcTypesData)
          ? funcTypesData.sort((a, b) =>
              (a.GrCod || "").localeCompare(b.GrCod || ""),
            )
          : [];

        setAllFunctionTypes(sortedData);
        setFunctionTypes(sortedData);

        toast.success("Designation deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete designation.");
      }
    } catch (error) {
      console.error("Error deleting designation:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete designation. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, deleteFunctionType: false }));
    }
  };

  const handleToggleVisibility = async (functionType) => {
    try {
      setLoadingState((prev) => ({ ...prev, toggleVisibility: true }));

      const newVisibility = functionType.isvisible == 1 ? 0 : 1;

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/designation/${functionType.Dsg_id}`,
        {
          ...functionType,
          isvisible: newVisibility,
        },
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );

      if (response.data.status == "success") {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/designation/all`,
              {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
        );
        const funcTypesData = refreshResponse.data.data || refreshResponse.data;
        const sortedData = Array.isArray(funcTypesData)
          ? funcTypesData.sort((a, b) =>
              (a.GrCod || "").localeCompare(b.GrCod || ""),
            )
          : [];

        setAllFunctionTypes(sortedData);
        setFunctionTypes(sortedData);

        toast.success(
          `Designation ${
            newVisibility == 1 ? "made visible" : "hidden"
          } successfully!`,
        );
      } else {
        toast.error(response.data.message || "Failed to update visibility.");
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update visibility. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, toggleVisibility: false }));
    }
  };

  const handleViewDetails = (functionType) => {
    setShowDetails(functionType.Dsg_id);
  };

  if (isLoading && loadingState.initialFetch) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading designations...</p>
      </div>
    );
  }

  // Format code with hyphens for display only
  const formatGroupCodeWithHyphens = (code) => {
    if (!code) return "—";
    // Ensure code is padded to 20 chars
    const paddedCode = code.padEnd(20, "0").substring(0, 20);
    // Split into pairs and join with hyphens for display
    const pairs = [];
    for (let i = 0; i < 20; i += 2) {
      pairs.push(paddedCode.substring(i, i + 2));
    }
    return pairs.join("-");
  };

  return (
    <div className="p-6">
      {/* Header with page title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center mb-1">
            <button
              onClick={() => navigate("/dashboard")}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          </div>
          <p className="text-gray-600 ml-9">
            Manage hierarchical designations (L1-L10 with 20-character codes)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Designation
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-12 gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
          const colors = [
            "blue",
            "green",
            "yellow",
            "purple",
            "pink",
            "indigo",
            "orange",
            "teal",
            "cyan",
            "rose",
          ];
          const color = colors[level - 1] || "gray";
          const levelStat = stats[`level${level}`] || 0;

          return (
            <div
              key={level}
              className={`bg-gradient-to-r from-${color}-50 to-${color}-100 border border-${color}-200 rounded-xl p-3`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-800">Level {level}</p>
                  <p className="text-lg font-bold text-gray-900">{levelStat}</p>
                </div>
                <div className={`bg-${color}-500 text-white p-1.5 rounded-lg`}>
                  <span className="text-xs font-bold">L{level}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-800">Visible</p>
              <p className="text-lg font-bold text-gray-900">{stats.visible}</p>
            </div>
            <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
              <EyeVisible className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-800">Hidden</p>
              <p className="text-lg font-bold text-gray-900">{stats.hidden}</p>
            </div>
            <div className="bg-gray-500 text-white p-1.5 rounded-lg">
              <EyeOff className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Designations Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  English Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Codes (20-char)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visibility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFunctionTypes.length > 0 ? (
                filteredFunctionTypes.map((functionType) => {
                  const { name, rowClass, level } =
                    getIndentedGroupNameAndStyle(functionType);
                  const isExpanded = expandedItems.has(functionType.Dsg_id);
                  const showExpandIcon = hasChildren(functionType);
                  const deptIds = parseDepartmentIds(functionType.Dpt_id);
                  const deptDisplays = getDepartmentName(deptIds);

                  return (
                    <tr
                      key={functionType.Dsg_id}
                      className={`hover:bg-gray-50 transition-colors ${rowClass}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedItems.includes(functionType.Dsg_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([
                                ...selectedItems,
                                functionType.Dsg_id,
                              ]);
                            } else {
                              setSelectedItems(
                                selectedItems.filter(
                                  (id) => id != functionType.Dsg_id,
                                ),
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-4">
                        {showExpandIcon && (
                          <button
                            onClick={() => toggleExpand(functionType)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <Minus className="h-4 w-4 text-gray-600" />
                            ) : (
                              <Plus className="h-4 w-4 text-gray-600" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center mr-3 ${
                              level == 1
                                ? "bg-blue-100 text-blue-600"
                                : level == 2
                                  ? "bg-green-100 text-green-600"
                                  : level == 3
                                    ? "bg-yellow-100 text-yellow-600"
                                    : level == 4
                                      ? "bg-purple-100 text-purple-600"
                                      : level == 5
                                        ? "bg-pink-100 text-pink-600"
                                        : level == 6
                                          ? "bg-indigo-100 text-indigo-600"
                                          : level == 7
                                            ? "bg-orange-100 text-orange-600"
                                            : level == 8
                                              ? "bg-teal-100 text-teal-600"
                                              : level == 9
                                                ? "bg-cyan-100 text-cyan-600"
                                                : "bg-rose-100 text-rose-600"
                            }`}
                          >
                            <span className="text-xs font-bold">L{level}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {name}
                              {functionType.isvisible == 0 && (
                                <span className="ml-2 text-xs text-gray-500 italic">
                                  (Hidden)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {functionType.Dsg_EName ? (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm text-gray-900">
                              {functionType.Dsg_EName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            No English name
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const deptIds = parseDepartmentIds(
                            functionType.Dpt_id,
                          );
                          const deptDisplays = getDepartmentName(deptIds);

                          return deptDisplays && deptDisplays.length > 0 ? (
                            <div className="space-y-2">
                              {deptDisplays.map((deptDisplay, idx) => (
                                <div key={idx} className="flex items-start">
                                  <Building2 className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <div className="flex flex-col">
                                    <span className="text-sm text-gray-900 whitespace-pre">
                                      {deptDisplay.primary}
                                    </span>
                                    {deptDisplay.secondary && (
                                      <span className="text-xs text-gray-500 italic whitespace-pre">
                                        {deptDisplay.secondary}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              —
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              Code:
                            </span>{" "}
                            <span className="font-mono text-xs">
                              {formatGroupCodeWithHyphens(functionType.GrCod)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Parent:{" "}
                            <span className="font-mono text-xs">
                              {functionType.UpGrp
                                ? functionTypes.find(
                                    (f) => f.Dsg_id == functionType.UpGrp,
                                  )?.GrCod
                                  ? formatGroupCodeWithHyphens(
                                      functionTypes.find(
                                        (f) => f.Dsg_id == functionType.UpGrp,
                                      )?.GrCod,
                                    )
                                  : "—"
                                : "None"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              level == 1
                                ? "bg-blue-100 text-blue-800"
                                : level == 2
                                  ? "bg-green-100 text-green-800"
                                  : level == 3
                                    ? "bg-yellow-100 text-yellow-800"
                                    : level == 4
                                      ? "bg-purple-100 text-purple-800"
                                      : level == 5
                                        ? "bg-pink-100 text-pink-800"
                                        : level == 6
                                          ? "bg-indigo-100 text-indigo-800"
                                          : level == 7
                                            ? "bg-orange-100 text-orange-800"
                                            : level == 8
                                              ? "bg-teal-100 text-teal-800"
                                              : level == 9
                                                ? "bg-cyan-100 text-cyan-800"
                                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Level {level}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleVisibility(functionType)}
                          disabled={loadingState.toggleVisibility}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            functionType.isvisible == 1
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                          title={
                            functionType.isvisible == 1
                              ? "Click to hide"
                              : "Click to show"
                          }
                        >
                          {functionType.isvisible == 1 ? (
                            <>
                              <EyeVisible className="h-3 w-3 mr-1" />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(functionType)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(functionType)}
                            className="text-purple-600 hover:text-purple-900 p-1.5 hover:bg-purple-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteFunctionType(
                                functionType.Dsg_id,
                                functionType.Dsg_Desc,
                              )
                            }
                            className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FolderTree className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium mb-1">
                        No Designations found
                      </p>
                      <p className="text-sm mb-4">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding your first designation"}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Designation
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Menu Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              setSelectedParentId("");
              setSelectedDeptIds([]);
              setFormError(null);
            }}
          />
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Add New Designation
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedParentId("");
                  setSelectedDeptIds([]);
                  setFormError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={loadingState.addFunctionType}
              >
                <XCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleAddFunctionType} className="space-y-4">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              )}

              {/* Parent Designation - Searchable Dropdown */}
              <div ref={parentDropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Designation
                </label>
                <div className="relative">
                  <button
                    ref={parentButtonRef}
                    type="button"
                    onClick={() =>
                      setIsParentDropdownOpen(!isParentDropdownOpen)
                    }
                    onKeyDown={handleParentButtonKeyDown}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white flex items-center justify-between"
                  >
                    <span
                      className={
                        selectedParentId ? "text-gray-900" : "text-gray-500"
                      }
                    >
                      {getSelectedParentDisplay()}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {/* Parent Dropdown Menu */}
                {isParentDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={parentSearchRef}
                          type="text"
                          value={parentSearchTerm}
                          onChange={(e) => setParentSearchTerm(e.target.value)}
                          onKeyDown={handleParentSearchKeyDown}
                          placeholder="Search by description, name, code..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          autoFocus
                        />
                        {parentSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setParentSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Designations List */}
                    <div className="overflow-y-auto max-h-64">
                      {/* None Option */}
                      <button
                        type="button"
                        onClick={() => handleParentSelect("")}
                        onKeyDown={(e) => {
                          if (e.key == "ArrowDown") {
                            e.preventDefault();
                            if (filteredParentDesignations.length > 0) {
                              setParentHighlightedIndex(0);
                            }
                          } else if (e.key == "Enter") {
                            e.preventDefault();
                            handleParentSelect("");
                          }
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                          parentHighlightedIndex == -1 ? "bg-blue-100" : ""
                        } ${!selectedParentId ? "bg-blue-50" : ""}`}
                        onMouseEnter={() => setParentHighlightedIndex(-1)}
                        tabIndex={parentHighlightedIndex == -1 ? 0 : -1}
                      >
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded flex items-center justify-center mr-3 bg-gray-100 text-gray-600">
                            <span className="text-xs font-bold">—</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              None (Top Level)
                            </div>
                          </div>
                          {!selectedParentId && (
                            <Check className="h-4 w-4 text-blue-600 ml-2" />
                          )}
                        </div>
                      </button>

                      {/* Designation Items */}
                      {filteredParentDesignations.length > 0 ? (
                        filteredParentDesignations.map((desig, idx) => {
                          const isSelected =
                            selectedParentId == desig.Dsg_id?.toString();
                          return (
                            <button
                              key={desig.Dsg_id}
                              ref={(el) => {
                                if (el) parentItemRefs.current[idx] = el;
                              }}
                              type="button"
                              onClick={() => handleParentSelect(desig.Dsg_id)}
                              onKeyDown={(e) =>
                                handleParentItemKeyDown(e, desig, idx)
                              }
                              onMouseEnter={() =>
                                setParentHighlightedIndex(idx)
                              }
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                                parentHighlightedIndex == idx
                                  ? "bg-blue-100 focus:bg-blue-100"
                                  : isSelected
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-700"
                              }`}
                              tabIndex={parentHighlightedIndex == idx ? 0 : -1}
                            >
                              <div className="font-medium">
                                {getParentDisplayName(desig)}
                              </div>
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
                          <p>No designations found</p>
                          <p className="text-xs mt-1">
                            Try a different search term
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>
                          {filteredParentDesignations.length + 1} items found
                        </span>
                        <span className="text-gray-400">
                          Use ↑ ↓ to navigate, Enter to select
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to create Level 1 designation
                </p>
              </div>

              {/* Department - Searchable Dropdown (MULTIPLE SELECTION) */}
              <div ref={deptDropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departments
                </label>

                {/* Selected Departments Tags */}
                {selectedDeptIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedDeptIds.map((id) => {
                      const dept = departments.find(
                        (d) => d.Dpt_id?.toString() == id,
                      );
                      if (!dept) return null;
                      const level = parseInt(dept.GrStt, 10) || 1;
                      return (
                        <div
                          key={id}
                          className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-sm border border-blue-200"
                        >
                          <Building2 className="h-3 w-3 mr-1" />
                          <span className="max-w-[150px] truncate">
                            {dept.Dpt_Desc || dept.Dpt_Name || id}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSelectedDept(id)}
                            className="ml-1 hover:text-blue-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={clearSelectedDepts}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <button
                    ref={deptButtonRef}
                    type="button"
                    onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                    onKeyDown={handleDeptButtonKeyDown}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white"
                  >
                    <span
                      className={
                        selectedDeptIds.length
                          ? "text-gray-900"
                          : "text-gray-500"
                      }
                    >
                      {getSelectedDeptDisplay()}
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
                </div>

                {/* Department Dropdown Menu */}
                {isDeptDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={deptSearchRef}
                          type="text"
                          value={deptSearchTerm}
                          onChange={(e) => setDeptSearchTerm(e.target.value)}
                          onKeyDown={handleDeptSearchKeyDown}
                          placeholder="Search departments by name, description..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          autoFocus
                        />
                        {deptSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setDeptSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Departments List */}
                    <div ref={deptListRef} className="overflow-y-auto max-h-64">
                      {/* Department Items */}
                      {filteredDepartments.length > 0 ? (
                        filteredDepartments.map((dept, idx) => {
                          const isSelected = isDeptSelected(dept.Dpt_id);
                          const level = parseInt(dept.GrStt, 10) || 1;

                          return (
                            <button
                              key={dept.Dpt_id}
                              ref={(el) => {
                                deptItemRefs.current[idx] = el;
                              }}
                              type="button"
                              onClick={() => toggleDeptSelection(dept.Dpt_id)}
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
                                  className={`h-6 w-6 rounded flex items-center justify-center mr-3 flex-shrink-0 ${
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
                                    {dept.Dpt_Desc || "No Description"}
                                  </div>
                                  {dept.Dpt_Name && (
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
                                  <Check className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Building2 className="h-8 w-8 mx-auto text-gray-300 mb-2" />
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
                        <span>{filteredDepartments.length} items found</span>
                        <span className="text-gray-400">
                          Use ↑ ↓ to navigate, Enter to select multiple
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Select multiple departments for this designation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  name="Dsg_Desc"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter designation description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  English Name
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    name="Dsg_EName"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter English name (optional)"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: English name for the designation
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedParentId("");
                    setSelectedDeptIds([]);
                    setFormError(null);
                  }}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loadingState.addFunctionType}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                  disabled={loadingState.addFunctionType}
                >
                  {loadingState.addFunctionType
                    ? "Creating..."
                    : "Create Designation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {showEditForm && editFunctionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowEditForm(null);
              setSelectedDeptIds([]);
              setFormError(null);
            }}
          />
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Designation (Level {editFunctionType.GrStt})
              </h2>
              <button
                onClick={() => {
                  setShowEditForm(null);
                  setSelectedDeptIds([]);
                  setFormError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={loadingState.updateFunctionType}
              >
                <XCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleUpdateFunctionType} className="space-y-4">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              )}

              {/* Department - Searchable Dropdown (Edit) - MULTIPLE SELECTION */}
              <div ref={deptDropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departments
                </label>

                {/* Selected Departments Tags */}
                {selectedDeptIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedDeptIds.map((id) => {
                      const dept = departments.find(
                        (d) => d.Dpt_id?.toString() == id,
                      );
                      if (!dept) return null;
                      const level = parseInt(dept.GrStt, 10) || 1;
                      return (
                        <div
                          key={id}
                          className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-sm border border-blue-200"
                        >
                          <Building2 className="h-3 w-3 mr-1" />
                          <span className="max-w-[150px] truncate">
                            {dept.Dpt_Desc || dept.Dpt_Name || id}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSelectedDept(id)}
                            className="ml-1 hover:text-blue-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={clearSelectedDepts}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <button
                    ref={deptButtonRef}
                    type="button"
                    onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                    onKeyDown={handleDeptButtonKeyDown}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white"
                  >
                    <span
                      className={
                        selectedDeptIds.length
                          ? "text-gray-900"
                          : "text-gray-500"
                      }
                    >
                      {getSelectedDeptDisplay()}
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
                </div>

                {/* Department Dropdown Menu (Edit) */}
                {isDeptDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={deptSearchRef}
                          type="text"
                          value={deptSearchTerm}
                          onChange={(e) => setDeptSearchTerm(e.target.value)}
                          onKeyDown={handleDeptSearchKeyDown}
                          placeholder="Search departments by name, description..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          autoFocus
                        />
                        {deptSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setDeptSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Departments List */}
                    <div ref={deptListRef} className="overflow-y-auto max-h-64">
                      {/* Department Items */}
                      {filteredDepartments.length > 0 ? (
                        filteredDepartments.map((dept, idx) => {
                          const isSelected = isDeptSelected(dept.Dpt_id);
                          const level = parseInt(dept.GrStt, 10) || 1;

                          return (
                            <button
                              key={dept.Dpt_id}
                              ref={(el) => {
                                deptItemRefs.current[idx] = el;
                              }}
                              type="button"
                              onClick={() => toggleDeptSelection(dept.Dpt_id)}
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
                                  className={`h-6 w-6 rounded flex items-center justify-center mr-3 flex-shrink-0 ${
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
                                    {dept.Dpt_Desc || "No Description"}
                                  </div>
                                  {dept.Dpt_Name && (
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
                                  <Check className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <Building2 className="h-8 w-8 mx-auto text-gray-300 mb-2" />
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
                        <span>{filteredDepartments.length} items found</span>
                        <span className="text-gray-400">
                          Use ↑ ↓ to navigate, Enter to select multiple
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Select multiple departments for this designation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  name="Dsg_Desc"
                  defaultValue={editFunctionType.Dsg_Desc}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter designation description"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  English Name
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    name="Dsg_EName"
                    defaultValue={editFunctionType.Dsg_EName || ""}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter English name (optional)"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: English name for the designation
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isvisible"
                      defaultChecked={editFunctionType.isvisible == 1}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Make this designation visible
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Visible designations will appear in the system
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(null);
                    setSelectedDeptIds([]);
                    setFormError(null);
                  }}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loadingState.updateFunctionType}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                  disabled={loadingState.updateFunctionType}
                >
                  {loadingState.updateFunctionType
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetails && functionTypes.find((ft) => ft.Dsg_id == showDetails) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetails(null)}
          />
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Designation Detail
              </h2>
              <button
                onClick={() => setShowDetails(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              {(() => {
                const functionType = functionTypes.find(
                  (ft) => ft.Dsg_id == showDetails,
                );
                const { name, level } =
                  getIndentedGroupNameAndStyle(functionType);
                const deptIds = parseDepartmentIds(functionType.Dpt_id);
                const deptList = deptIds
                  .map((id) =>
                    departments.find(
                      (d) => d.Dpt_id?.toString() == id?.toString(),
                    ),
                  )
                  .filter(Boolean);

                return (
                  <>
                    <div className="flex items-center mb-4">
                      <div
                        className={`h-12 w-12 rounded-lg flex items-center justify-center mr-4 ${
                          level == 1
                            ? "bg-blue-100 text-blue-600"
                            : level == 2
                              ? "bg-green-100 text-green-600"
                              : level == 3
                                ? "bg-yellow-100 text-yellow-600"
                                : level == 4
                                  ? "bg-purple-100 text-purple-600"
                                  : level == 5
                                    ? "bg-pink-100 text-pink-600"
                                    : level == 6
                                      ? "bg-indigo-100 text-indigo-600"
                                      : level == 7
                                        ? "bg-orange-100 text-orange-600"
                                        : level == 8
                                          ? "bg-teal-100 text-teal-600"
                                          : level == 9
                                            ? "bg-cyan-100 text-cyan-600"
                                            : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        <span className="text-lg font-bold">L{level}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {functionType.Dsg_Desc}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ID: {functionType.Dsg_id}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Group Code
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900 font-medium text-sm font-mono">
                            {formatGroupCodeWithHyphens(functionType.GrCod)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Parent ID
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900 text-sm">
                            {functionType.UpGrp || "None"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Group Serial
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {functionType.GrSrn || "—"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Level
                        </label>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              level == 1
                                ? "bg-blue-100 text-blue-800"
                                : level == 2
                                  ? "bg-green-100 text-green-800"
                                  : level == 3
                                    ? "bg-yellow-100 text-yellow-800"
                                    : level == 4
                                      ? "bg-purple-100 text-purple-800"
                                      : level == 5
                                        ? "bg-pink-100 text-pink-800"
                                        : level == 6
                                          ? "bg-indigo-100 text-indigo-800"
                                          : level == 7
                                            ? "bg-orange-100 text-orange-800"
                                            : level == 8
                                              ? "bg-teal-100 text-teal-800"
                                              : level == 9
                                                ? "bg-cyan-100 text-cyan-800"
                                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            Level {level}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">
                          Departments
                        </label>
                        <div className="mt-1">
                          {(() => {
                            const deptIds = parseDepartmentIds(
                              functionType.Dpt_id,
                            );
                            const deptList = deptIds
                              .map((id) =>
                                departments.find(
                                  (d) => d.Dpt_id?.toString() == id?.toString(),
                                ),
                              )
                              .filter(Boolean);

                            return deptList.length > 0 ? (
                              <div className="space-y-2">
                                {deptList.map((dept, idx) => {
                                  const deptLevel =
                                    parseInt(dept.GrStt, 10) || 1;
                                  return (
                                    <div key={idx} className="flex items-start">
                                      <div
                                        className={`h-6 w-6 rounded flex items-center justify-center mr-2 flex-shrink-0 ${
                                          deptLevel == 1
                                            ? "bg-blue-100 text-blue-600"
                                            : deptLevel == 2
                                              ? "bg-green-100 text-green-600"
                                              : deptLevel == 3
                                                ? "bg-amber-100 text-amber-600"
                                                : "bg-purple-100 text-purple-600"
                                        }`}
                                      >
                                        <span className="text-xs font-bold">
                                          L{deptLevel}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm text-gray-900">
                                          {dept.Dpt_Desc || "No Description"}
                                        </span>
                                        {dept.Dpt_Name && (
                                          <span className="text-xs text-gray-500 mt-0.5">
                                            {dept.Dpt_Name}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm italic">
                                No departments assigned
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Visibility
                        </label>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              functionType.isvisible == 1
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {functionType.isvisible == 1 ? (
                              <>
                                <EyeVisible className="h-3 w-3 mr-1" />
                                Visible
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hidden
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        English Name
                      </label>
                      <div className="mt-1">
                        {functionType.Dsg_EName ? (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-gray-900 text-sm">
                              {functionType.Dsg_EName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            No English name
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Created At
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {functionType.created_at
                              ? new Date(
                                  functionType.created_at,
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Updated At
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {functionType.updated_at
                              ? new Date(
                                  functionType.updated_at,
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-4">
                      <button
                        onClick={() => setShowDetails(null)}
                        className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
