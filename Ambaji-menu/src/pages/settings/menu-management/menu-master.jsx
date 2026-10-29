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
  Link as LinkIcon,
  ArrowLeft,
  Eye as EyeVisible,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  XCircle as XCircleIcon,
  Zap,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

export default function MenuMaster() {
  const navigate = useNavigate();
  const [functionTypes, setFunctionTypes] = useState([]);
  const [allFunctionTypes, setAllFunctionTypes] = useState([]);
  const [actionTypes, setActionTypes] = useState([]);
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
    fetchActions: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [formError, setFormError] = useState(null);

  // Gen Voucher dropdown
  const [genVoucherOptions, setGenVoucherOptions] = useState([]);
  const [selectedGvnNo, setSelectedGvnNo] = useState("");
  const [selectedEditGvnNo, setSelectedEditGvnNo] = useState("");

  // Add form action dropdown states
  const [actionSearchTerm, setActionSearchTerm] = useState("");
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const [actionHighlightedIndex, setActionHighlightedIndex] = useState(-1);
  const [selectedActionId, setSelectedActionId] = useState(""); // Store selected action ID for add form
  const actionDropdownRef = useRef(null);
  const actionSearchInputRef = useRef(null);
  const actionItemRefs = useRef([]);
  const actionListRef = useRef(null);
  const actionButtonRef = useRef(null);

  // Edit form action dropdown states
  const [editActionSearchTerm, setEditActionSearchTerm] = useState("");
  const [isEditActionDropdownOpen, setIsEditActionDropdownOpen] =
    useState(false);
  const [editActionHighlightedIndex, setEditActionHighlightedIndex] =
    useState(-1);
  const [selectedEditActionId, setSelectedEditActionId] = useState(""); // Store selected action ID for edit form
  const editActionDropdownRef = useRef(null);
  const editActionSearchInputRef = useRef(null);
  const editActionItemRefs = useRef([]);
  const editActionListRef = useRef(null);
  const editActionButtonRef = useRef(null);

  const editor = useRef(null);

  const config = {
    readonly: false,
    height: 400,
    toolbarAdaptive: false,
    toolbarButtonSize: "middle",
    buttons: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "align",
      "|",
      "link",
      "image",
      "|",
      "table",
      "|",
      "undo",
      "redo",
    ],
    uploader: { insertImageAsBase64URI: true },
    removeButtons: ["speechRecognize", "copyformat"],
    showCharsCounter: false,
    showWordsCounter: false,
    toolbarSticky: false,
    autofocus: false,
    saveSelectionOnBlur: true,
    spellcheck: true,
  };

  const isLoading = Object.values(loadingState).some((state) => state);

  const getNextGroupCode = (parentFunction) => {
    if (!parentFunction) {
      const level1Items = allFunctionTypes.filter((ft) => ft.GrStt == "1");
      const maxCode = level1Items.reduce((max, item) => {
        const codeNum = parseInt(item.GrCod.substring(0, 2));
        return codeNum > max ? codeNum : max;
      }, 0);
      const nextCode = (maxCode + 1).toString().padStart(2, "0");
      return {
        GrCod: `${nextCode}000000`,
        GrSrn: "1",
        GrStt: "1",
        UpGrp: `${nextCode}000000`,
        isvisible: 1,
        Is_Quick_Action: false,
      };
    }

    const parentGrcod = parentFunction.GrCod;
    const parentGrsh = parentFunction.GrStt;

    if (parentGrsh == "1") {
      const siblings = allFunctionTypes.filter(
        (ft) =>
          ft.GrCod.startsWith(parentGrcod.substring(0, 2)) &&
          ft.GrCod.match(/^\d{2}\d{2}0000$/) &&
          ft.GrStt == "2",
      );

      const maxSibling = siblings.reduce((max, item) => {
        const siblingNum = parseInt(item.GrCod.substring(2, 4));
        return siblingNum > max ? siblingNum : max;
      }, 0);

      const nextNum = maxSibling + 1;
      return {
        GrCod: `${parentGrcod.substring(0, 2)}${nextNum
          .toString()
          .padStart(2, "0")}0000`,
        GrSrn: (siblings.length + 1).toString(),
        GrStt: "2",
        UpGrp: parentGrcod,
        isvisible: 1,
        Is_Quick_Action: false,
      };
    } else if (parentGrsh == "2") {
      const siblings = allFunctionTypes.filter(
        (ft) =>
          ft.GrCod.startsWith(parentGrcod.substring(0, 4)) &&
          ft.GrCod.match(/^\d{2}\d{2}\d{2}00$/) &&
          ft.GrStt == "3",
      );

      const maxSibling = siblings.reduce((max, item) => {
        const siblingNum = parseInt(item.GrCod.substring(4, 6));
        return siblingNum > max ? siblingNum : max;
      }, 0);

      const nextNum = maxSibling + 1;
      return {
        GrCod: `${parentGrcod.substring(0, 4)}${nextNum
          .toString()
          .padStart(2, "0")}00`,
        GrSrn: (siblings.length + 1).toString(),
        GrStt: "3",
        UpGrp: parentGrcod,
        isvisible: 1,
        Is_Quick_Action: false,
      };
    } else if (parentGrsh == "3") {
      const siblings = allFunctionTypes.filter(
        (ft) =>
          ft.GrCod.startsWith(parentGrcod.substring(0, 6)) &&
          ft.GrCod.match(/^\d{2}\d{2}\d{2}\d{2}$/) &&
          ft.GrStt == "4",
      );

      const maxSibling = siblings.reduce((max, item) => {
        const siblingNum = parseInt(item.GrCod.substring(6, 8));
        return siblingNum > max ? siblingNum : max;
      }, 0);

      const nextNum = maxSibling + 1;
      return {
        GrCod: `${parentGrcod.substring(0, 6)}${nextNum
          .toString()
          .padStart(2, "0")}`,
        GrSrn: (siblings.length + 1).toString(),
        GrStt: "4",
        UpGrp: parentGrcod,
        isvisible: 1,
        Is_Quick_Action: false,
      };
    }

    return {
      GrCod: parentGrcod,
      GrSrn: "1",
      GrStt: "4",
      UpGrp: parentGrcod,
      isvisible: 1,
      Is_Quick_Action: false,
    };
  };

  const getFilteredFunctionTypes = () => {
    if (expandedItems.size == 0) {
      return functionTypes.filter((ft) => ft.GrStt == "1");
    }

    const visibleItems = [];

    functionTypes.forEach((ft) => {
      if (ft.GrStt == "1") {
        visibleItems.push(ft);
      } else {
        const parentPrefix = ft.GrCod.substring(0, 2);
        const isParentExpanded = Array.from(expandedItems).some(
          (expandedId) => {
            const expandedItem = functionTypes.find(
              (item) => item.Fnc_Id == expandedId,
            );
            return (
              expandedItem &&
              expandedItem.GrCod.startsWith(parentPrefix) &&
              expandedItem.GrStt == "1"
            );
          },
        );

        if (isParentExpanded) {
          visibleItems.push(ft);
        }
      }
    });

    return visibleItems.sort((a, b) => a.GrCod.localeCompare(b.GrCod));
  };

  const filteredFunctionTypes = getFilteredFunctionTypes();

  const stats = {
    total: functionTypes.length,
    level1: functionTypes.filter((ft) => ft.GrStt == "1").length,
    level2: functionTypes.filter((ft) => ft.GrStt == "2").length,
    level3: functionTypes.filter((ft) => ft.GrStt == "3").length,
    level4: functionTypes.filter((ft) => ft.GrStt == "4").length,
    visible: functionTypes.filter((ft) => ft.isvisible == 1).length,
    hidden: functionTypes.filter((ft) => ft.isvisible == 0).length,
    quickActions: functionTypes.filter(
      (ft) => ft.Is_Quick_Action == true || ft.Is_Quick_Action == 1,
    ).length,
  };

  const toggleExpand = (functionType) => {
    const newExpandedItems = new Set(expandedItems);
    if (expandedItems.has(functionType.Fnc_Id)) {
      newExpandedItems.delete(functionType.Fnc_Id);
    } else {
      newExpandedItems.add(functionType.Fnc_Id);
    }
    setExpandedItems(newExpandedItems);
  };

  const hasChildren = (functionType) => {
    if (functionType.GrStt != "1") return false;
    const prefix = functionType.GrCod.substring(0, 2);
    return functionTypes.some(
      (ft) =>
        ft.GrStt != "1" &&
        ft.GrCod.startsWith(prefix) &&
        ft.Fnc_Id != functionType.Fnc_Id,
    );
  };

  const getIndentedGroupNameAndStyle = (functionType) => {
    const indentLevels = {
      1: "",
      2: "    ",
      3: "        ",
      4: "            ",
    };
    const rowStyles = {
      1: "bg-blue-50",
      2: "bg-green-50",
      3: "bg-yellow-50",
      4: "bg-purple-50",
    };

    const opacityClass = functionType.isvisible == 0 ? "opacity-60" : "";

    return {
      name: `${indentLevels[functionType.GrStt] || ""}${functionType.Fnc_Desc}`,
      rowClass: `${
        rowStyles[functionType.GrStt] || "bg-gray-50"
      } ${opacityClass}`,
    };
  };

  // Filter actions based on search term
  const filterActions = (searchTerm) => {
    if (!searchTerm.trim()) return actionTypes;

    return actionTypes.filter(
      (action) =>
        action.stage &&
        action.stage.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(event.target)
      ) {
        setIsActionDropdownOpen(false);
        setActionSearchTerm("");
        setActionHighlightedIndex(-1);
      }
      if (
        editActionDropdownRef.current &&
        !editActionDropdownRef.current.contains(event.target)
      ) {
        setIsEditActionDropdownOpen(false);
        setEditActionSearchTerm("");
        setEditActionHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isActionDropdownOpen && actionSearchInputRef.current) {
      setTimeout(() => actionSearchInputRef.current.focus(), 0);
    }
  }, [isActionDropdownOpen]);

  useEffect(() => {
    if (isEditActionDropdownOpen && editActionSearchInputRef.current) {
      setTimeout(() => editActionSearchInputRef.current.focus(), 0);
    }
  }, [isEditActionDropdownOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (
      isActionDropdownOpen &&
      actionHighlightedIndex >= 0 &&
      actionListRef.current
    ) {
      const container = actionListRef.current;
      const item = actionItemRefs.current[actionHighlightedIndex];
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
  }, [actionHighlightedIndex, isActionDropdownOpen]);

  useEffect(() => {
    if (
      isEditActionDropdownOpen &&
      editActionHighlightedIndex >= 0 &&
      editActionListRef.current
    ) {
      const container = editActionListRef.current;
      const item = editActionItemRefs.current[editActionHighlightedIndex];
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
  }, [editActionHighlightedIndex, isEditActionDropdownOpen]);

  // Action dropdown keyboard handlers
  const handleActionKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsActionDropdownOpen(true);
      setActionSearchTerm("");
      setActionHighlightedIndex(-1);
      setTimeout(() => actionSearchInputRef.current?.focus(), 0);
    }
  };

  const handleActionSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const filtered = filterActions(actionSearchTerm);
      if (filtered.length > 0) {
        setActionHighlightedIndex(0);
        setTimeout(() => {
          if (actionItemRefs.current[0]) {
            actionItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      // Stay in search
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsActionDropdownOpen(false);
      setActionHighlightedIndex(-1);
      setActionSearchTerm("");
      actionButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      const filtered = filterActions(actionSearchTerm);
      if (filtered.length > 0 && actionHighlightedIndex >= 0) {
        handleActionSelect(filtered[actionHighlightedIndex]);
      } else if (filtered.length > 0) {
        handleActionSelect(filtered[0]);
      }
    }
  };

  const handleActionItemKeyDown = (e, action, idx) => {
    const filtered = filterActions(actionSearchTerm);
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filtered.length) {
        setActionHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (actionItemRefs.current[nextIndex]) {
            actionItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setActionHighlightedIndex(-1);
        setTimeout(() => actionSearchInputRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setActionHighlightedIndex(-1);
        setTimeout(() => actionSearchInputRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setActionHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (actionItemRefs.current[prevIndex]) {
            actionItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleActionSelect(action);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsActionDropdownOpen(false);
      setActionHighlightedIndex(-1);
      setActionSearchTerm("");
      actionButtonRef.current?.focus();
    }
  };

  const handleActionSelect = (action) => {
    setSelectedActionId(action.Act_Id);
    setIsActionDropdownOpen(false);
    setActionSearchTerm("");
    setActionHighlightedIndex(-1);

    if (formError && formError.includes("Action")) {
      setFormError(null);
    }
  };

  // Edit form action dropdown handlers
  const handleEditActionKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsEditActionDropdownOpen(true);
      setEditActionSearchTerm("");
      setEditActionHighlightedIndex(-1);
      setTimeout(() => editActionSearchInputRef.current?.focus(), 0);
    }
  };

  const handleEditActionSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const filtered = filterActions(editActionSearchTerm);
      if (filtered.length > 0) {
        setEditActionHighlightedIndex(0);
        setTimeout(() => {
          if (editActionItemRefs.current[0]) {
            editActionItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEditActionDropdownOpen(false);
      setEditActionHighlightedIndex(-1);
      setEditActionSearchTerm("");
      editActionButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      const filtered = filterActions(editActionSearchTerm);
      if (filtered.length > 0 && editActionHighlightedIndex >= 0) {
        handleEditActionSelect(filtered[editActionHighlightedIndex]);
      } else if (filtered.length > 0) {
        handleEditActionSelect(filtered[0]);
      }
    }
  };

  const handleEditActionItemKeyDown = (e, action, idx) => {
    const filtered = filterActions(editActionSearchTerm);
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filtered.length) {
        setEditActionHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (editActionItemRefs.current[nextIndex]) {
            editActionItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setEditActionHighlightedIndex(-1);
        setTimeout(() => editActionSearchInputRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setEditActionHighlightedIndex(-1);
        setTimeout(() => editActionSearchInputRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setEditActionHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (editActionItemRefs.current[prevIndex]) {
            editActionItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleEditActionSelect(action);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEditActionDropdownOpen(false);
      setEditActionHighlightedIndex(-1);
      setEditActionSearchTerm("");
      editActionButtonRef.current?.focus();
    }
  };

  const handleEditActionSelect = (action) => {
    setSelectedEditActionId(action.Act_Id);
    setIsEditActionDropdownOpen(false);
    setEditActionSearchTerm("");
    setEditActionHighlightedIndex(-1);

    if (formError && formError.includes("Action")) {
      setFormError(null);
    }
  };

  const clearActionSearch = () => {
    setActionSearchTerm("");
    setActionHighlightedIndex(-1);
    if (actionSearchInputRef.current) {
      actionSearchInputRef.current.focus();
    }
  };

  const clearEditActionSearch = () => {
    setEditActionSearchTerm("");
    setEditActionHighlightedIndex(-1);
    if (editActionSearchInputRef.current) {
      editActionSearchInputRef.current.focus();
    }
  };

  const getSelectedActionName = () => {
    if (!selectedActionId) return "Select action (optional)";
    const action = actionTypes.find((a) => a.Act_Id == selectedActionId);
    if (!action) return "Select action (optional)";
    return action.stage;
  };

  const getSelectedEditActionName = () => {
    if (!selectedEditActionId) return "Select action (optional)";
    const action = actionTypes.find((a) => a.Act_Id == selectedEditActionId);
    if (!action) return "Select action (optional)";
    return action.stage;
  };

  // Fetch action types - only those with Previous_Status null
  const fetchActionTypes = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, fetchActions: true }));
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/action-master/all`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      if (response.data.status) {
        // Filter actions to only include those with Previous_Status null
        const filteredActions = (response.data.data || []).filter(
          (action) => action.Previous_Status == null,
        );
        setActionTypes(filteredActions);
      }
    } catch (error) {
      console.error("Error fetching action types:", error);
      toast.error("Failed to load action types.");
    } finally {
      setLoadingState((prev) => ({ ...prev, fetchActions: false }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingState((prev) => ({ ...prev, initialFetch: true }));

        // Fetch menu items, action types, and gen voucher options in parallel
        const [menuResponse, actionsResponse, genVoucherResponse] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_URL}/menu-master/lst-menu-master`,
            {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
          ),
          axios.get(`${import.meta.env.VITE_API_URL}/action-master/all`,
            {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
          ),
          axios.get(`${import.meta.env.VITE_API_URL}/gen-voucher/all`,
            {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
          ),
        ]);

        // Process menu data
        const funcTypesData = menuResponse.data.data || menuResponse.data;
        const sortedFuncTypes = Array.isArray(funcTypesData)
          ? funcTypesData.sort((a, b) => a.GrCod.localeCompare(b.GrCod))
          : [];

        setAllFunctionTypes(sortedFuncTypes);
        setFunctionTypes(sortedFuncTypes);

        // Process action data - only those with Previous_Status null
        if (actionsResponse.data.status) {
          const filteredActions = (actionsResponse.data.data || []).filter(
            (action) => action.Previous_Status == null,
          );
          setActionTypes(filteredActions);
        }

        // Process gen voucher options
        if (genVoucherResponse.data.success) {
          setGenVoucherOptions(genVoucherResponse.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoadingState((prev) => ({ ...prev, initialFetch: false }));
      }
    };
    fetchData();
  }, []);

  const handleAddFunctionType = async (e) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const functionId = formData.get("Fnc_Id");
    const Fnc_Desc = formData.get("Fnc_Desc");
    const Fnc_Title = formData.get("Fnc_Title");
    const Description = formData.get("Description") || "";
    const Menu_Links = formData.get("Menu_Links");
    const Mod_Code = formData.get("Mod_Code");
    const Act_Id = selectedActionId || null;
    const gvn_no = selectedGvnNo || null;
    const Is_Quick_Action = formData.get("Is_Quick_Action") == "on" ? 1 : 0;
    const isvisible = 1;

    if (!Fnc_Desc) {
      setFormError("Description is required.");
      return;
    }

    try {
      setLoadingState((prev) => ({ ...prev, addFunctionType: true }));

      const parentFunction = allFunctionTypes.find(
        (ft) => ft.Fnc_Id == functionId,
      );
      const newGroupCode = getNextGroupCode(parentFunction);

      const newFunctionType = {
        Fnc_Desc,
        Fnc_Title: Fnc_Title || null,
        Description: Description,
        ...newGroupCode,
        Fnc_Id: functionId || null,
        Menu_Links: Menu_Links || null,
        Mod_Code: Mod_Code || null,
        Act_Id: Act_Id,
        gvn_no: gvn_no,
        Is_Quick_Action: Is_Quick_Action,
        isvisible: isvisible,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/menu-master`,
        newFunctionType,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      if (response.data.status == "success") {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/menu-master/lst-menu-master`,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
        );
        const funcTypesData = refreshResponse.data.data || refreshResponse.data;
        const sortedData = Array.isArray(funcTypesData)
          ? funcTypesData.sort((a, b) => a.GrCod.localeCompare(b.GrCod))
          : [];

        setAllFunctionTypes(sortedData);
        setFunctionTypes(sortedData);

        setShowForm(false);
        setFormError(null);
        setActionSearchTerm("");
        setSelectedActionId("");
        setSelectedGvnNo("");
        setIsActionDropdownOpen(false);
        toast.success("Function type added successfully!");
      } else {
        setFormError(response.data.message || "Failed to add function type.");
      }
    } catch (error) {
      console.error("Error adding function type:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to add function type. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, addFunctionType: false }));
    }
  };

  const handleEdit = (functionType) => {
    setEditFunctionType(functionType);
    setShowEditForm(functionType.Fnc_Id);
    setFormError(null);
    setEditActionSearchTerm("");
    setSelectedEditActionId(functionType.Act_Id || "");
    setSelectedEditGvnNo(functionType.gvn_no || "");
    setIsEditActionDropdownOpen(false);
  };

  const handleUpdateFunctionType = async (e) => {
    e.preventDefault();
    if (!editFunctionType) return;

    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const Fnc_Desc = formData.get("Fnc_Desc");
    const Fnc_Title = formData.get("Fnc_Title");
    const Description = formData.get("Description") || "";
    const Menu_Links = formData.get("Menu_Links");
    const Mod_Code = formData.get("Mod_Code");
    const Act_Id = selectedEditActionId || null;
    const gvn_no = selectedEditGvnNo || null;
    const Is_Quick_Action = formData.get("Is_Quick_Action") == "on" ? 1 : 0;
    const isvisible = formData.get("isvisible") == "on" ? 1 : 0;

    if (!Fnc_Desc) {
      setFormError("Description is required.");
      return;
    }

    const updatedFunctionType = {
      Fnc_Desc: Fnc_Desc || editFunctionType.Fnc_Desc,
      Fnc_Title: Fnc_Title == "" ? null : Fnc_Title,
      Description: Description == "" ? null : Description,
      Menu_Links: Menu_Links == "" ? null : Menu_Links,
      Mod_Code: Mod_Code == "" ? null : Mod_Code,
      Act_Id: Act_Id,
      gvn_no: gvn_no,
      Is_Quick_Action: Is_Quick_Action,
      UpGrp: editFunctionType.UpGrp,
      GrCod: editFunctionType.GrCod,
      GrSrn: editFunctionType.GrSrn,
      GrStt: editFunctionType.GrStt,
      Fnc_Id: editFunctionType.Fnc_Id,
      isvisible: isvisible,
    };

    try {
      setLoadingState((prev) => ({ ...prev, updateFunctionType: true }));
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/menu-master/${editFunctionType.Fnc_Id}`,
        updatedFunctionType,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      if (response.data.status == "success") {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/menu-master/lst-menu-master`,
          {
            headers : { 
                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
          }
          }
        );
        const funcTypesData = refreshResponse.data.data || refreshResponse.data;
        const sortedData = Array.isArray(funcTypesData)
          ? funcTypesData.sort((a, b) => a.GrCod.localeCompare(b.GrCod))
          : [];

        setAllFunctionTypes(sortedData);
        setFunctionTypes(sortedData);

        setShowEditForm(null);
        setEditFunctionType(null);
        setFormError(null);
        setSelectedEditActionId("");
        setSelectedEditGvnNo("");
        toast.success("Function type updated successfully!");
      } else {
        setFormError(
          response.data.message || "Failed to update function type.",
        );
      }
    } catch (error) {
      console.error("Error updating function type:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to update function type. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, updateFunctionType: false }));
    }
  };

  const handleDeleteFunctionType = async (Fnc_Id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      setLoadingState((prev) => ({ ...prev, deleteFunctionType: true }));
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/menu-master/${Fnc_Id}`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      if (response.data.status == "success") {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/menu-master/lst-menu-master`,
          {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
        );
        const funcTypesData = refreshResponse.data.data || refreshResponse.data;
        const sortedData = Array.isArray(funcTypesData)
          ? funcTypesData.sort((a, b) => a.GrCod.localeCompare(b.GrCod))
          : [];

        setAllFunctionTypes(sortedData);
        setFunctionTypes(sortedData);

        toast.success("Function type deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete function type.");
      }
    } catch (error) {
      console.error("Error deleting function type:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete function type. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, deleteFunctionType: false }));
    }
  };

  const handleToggleVisibility = async (functionType) => {
    try {
      setLoadingState((prev) => ({ ...prev, toggleVisibility: true }));

      const newVisibility = functionType.isvisible == 1 ? 0 : 1;

      // Use dedicated endpoint - only toggles isvisible, no Act_Id validation issue
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/function-types/${functionType.Fnc_Id}/toggle-visibility`,
        {},
        {
          headers : {
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
        }
      );

      if (response.data.status == "success") {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/menu-master/lst-menu-master`,
          {
            headers : { 
                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
          }
          }
        );
        const funcTypesData = refreshResponse.data.data || refreshResponse.data;
        const sortedData = Array.isArray(funcTypesData)
          ? funcTypesData.sort((a, b) => a.GrCod.localeCompare(b.GrCod))
          : [];

        setAllFunctionTypes(sortedData);
        setFunctionTypes(sortedData);

        toast.success(
          `Menu item ${
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
    setShowDetails(functionType.Fnc_Id);
  };

  const handleRefresh = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, filterFunctionType: true }));
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/menu-master/lst-menu-master`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      const funcTypesData = response.data.data || response.data;
      const sortedData = Array.isArray(funcTypesData)
        ? funcTypesData.sort((a, b) => a.GrCod.localeCompare(b.GrCod))
        : [];

      setAllFunctionTypes(sortedData);
      setFunctionTypes(sortedData);

      setExpandedItems(new Set());
      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data. Please try again.");
    } finally {
      setLoadingState((prev) => ({ ...prev, filterFunctionType: false }));
    }
  };

  // Build a readable label for a gen voucher option
  const buildVoucherLabel = (v) => {
    if (!v) return "";
    const parts = [];
    if (v.prifix) parts.push({ val: v.prifix, sep: v.prifix_dev_type || v.dev_type || "/" });
    if (v.Dept == "Y") parts.push({ val: "DEPT",   sep: v.dept_dev_type  || v.dev_type || "/" });
    if (v.Text)  parts.push({ val: v.Text,          sep: v.text_dev_type  || v.dev_type || "/" });
    parts.push({ val: "1",                           sep: v.no_dev_type    || v.dev_type || "/" });
    if (v.FY == "Y") parts.push({ val: "2025-26",   sep: null });
    return parts.map((p, i) => (i < parts.length - 1 ? p.val + p.sep : p.val)).join("");
  };

  // Helper function to get action display name with null checks
  const getActionDisplay = (functionType) => {
    if (!functionType) return null;

    if (functionType.action) {
      return functionType.action.stage;
    } else if (functionType.Act_Id) {
      const action = actionTypes?.find((a) => a.Act_Id == functionType.Act_Id);
      return action ? action.stage : `Action ID: ${functionType.Act_Id}`;
    }
    return null;
  };

  if (isLoading && loadingState.initialFetch) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center mb-1">
            <button
              onClick={() => navigate("/dashboard")}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Menu Management
            </h1>
          </div>
          <p className="text-gray-600 ml-9">Manage hierarchical menu items</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-8 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">Total Menu Items</p>
              <p className="text-xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <FolderTree className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800">Level 1</p>
              <p className="text-xl font-bold text-green-900">{stats.level1}</p>
            </div>
            <div className="bg-green-500 text-white p-2 rounded-lg">
              <span className="text-xs font-bold">L1</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800">Level 2</p>
              <p className="text-xl font-bold text-yellow-900">
                {stats.level2}
              </p>
            </div>
            <div className="bg-yellow-500 text-white p-2 rounded-lg">
              <span className="text-xs font-bold">L2</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-800">Level 3</p>
              <p className="text-xl font-bold text-purple-900">
                {stats.level3}
              </p>
            </div>
            <div className="bg-purple-500 text-white p-2 rounded-lg">
              <span className="text-xs font-bold">L3</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-pink-800">Level 4</p>
              <p className="text-xl font-bold text-pink-900">{stats.level4}</p>
            </div>
            <div className="bg-pink-500 text-white p-2 rounded-lg">
              <span className="text-xs font-bold">L4</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-800">Visible</p>
              <p className="text-xl font-bold text-emerald-900">
                {stats.visible}
              </p>
            </div>
            <div className="bg-emerald-500 text-white p-2 rounded-lg">
              <EyeVisible className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800">Hidden</p>
              <p className="text-xl font-bold text-gray-900">{stats.hidden}</p>
            </div>
            <div className="bg-gray-500 text-white p-2 rounded-lg">
              <EyeOff className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-800">Quick Actions</p>
              <p className="text-xl font-bold text-amber-900">
                {stats.quickActions}
              </p>
            </div>
            <div className="bg-amber-500 text-white p-2 rounded-lg">
              <Zap className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1"></div>
        </div>
      </div>

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
                  Menu Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quick Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gen Voucher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Menu Links
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Codes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status (GrStt)
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
                  const { name, rowClass } =
                    getIndentedGroupNameAndStyle(functionType);
                  const isExpanded = expandedItems.has(functionType.Fnc_Id);
                  const showExpandIcon =
                    functionType.GrStt == "1" && hasChildren(functionType);

                  const grshStatus =
                    functionType.GrStt == "1"
                      ? "Level 1"
                      : functionType.GrStt == "2"
                        ? "Level 2"
                        : functionType.GrStt == "3"
                          ? "Level 3"
                          : "Level 4";

                  const actionDisplay = getActionDisplay(functionType);

                  return (
                    <tr
                      key={functionType.Fnc_Id}
                      className={`hover:bg-gray-50 transition-colors ${rowClass}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedItems.includes(functionType.Fnc_Id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([
                                ...selectedItems,
                                functionType.Fnc_Id,
                              ]);
                            } else {
                              setSelectedItems(
                                selectedItems.filter(
                                  (Fnc_Id) => Fnc_Id != functionType.Fnc_Id,
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
                              functionType.GrStt == "1"
                                ? "bg-blue-100 text-blue-600"
                                : functionType.GrStt == "2"
                                  ? "bg-green-100 text-green-600"
                                  : functionType.GrStt == "3"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-purple-100 text-purple-600"
                            }`}
                          >
                            <span className="text-xs font-bold">
                              L{functionType.GrStt}
                            </span>
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
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {functionType.Fnc_Id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {actionDisplay ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {actionDisplay}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            No action
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {functionType.Is_Quick_Action ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Zap className="h-3 w-3 mr-1" />
                            Quick Action
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {functionType.gen_voucher_no ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 font-mono">
                            {buildVoucherLabel(functionType.gen_voucher_no)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {functionType.Menu_Links ? (
                          <div className="flex items-center">
                            <LinkIcon className="h-4 w-4 text-blue-500 mr-2" />
                            <div className="max-w-xs truncate text-sm text-blue-600 hover:text-blue-800">
                              <a
                                href={functionType.Menu_Links}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {functionType.Menu_Links}
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            No link
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              Code:
                            </span>{" "}
                            {functionType.GrCod}
                          </div>
                          <div className="text-xs text-gray-500">
                            Parent: {functionType.UpGrp || "None"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {functionType.GrStt == "1" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {grshStatus}
                            </span>
                          ) : functionType.GrStt == "2" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {grshStatus}
                            </span>
                          ) : functionType.GrStt == "3" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {grshStatus}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {grshStatus}
                            </span>
                          )}
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
                                functionType.Fnc_Id,
                                functionType.Fnc_Desc,
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
                  <td colSpan="11" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FolderTree className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-lg font-medium mb-1">
                        No function types found
                      </p>
                      <p className="text-sm mb-4">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "Get started by adding your first function type"}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Menu Item
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

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              setFormError(null);
              setActionSearchTerm("");
              setIsActionDropdownOpen(false);
              setSelectedActionId("");
            }}
          />
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Add New Menu Item
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormError(null);
                  setActionSearchTerm("");
                  setIsActionDropdownOpen(false);
                  setSelectedActionId("");
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Menu Item
                </label>
                <div className="relative">
                  <select
                    name="Fnc_Id"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select Parent Menu</option>
                    {Array.isArray(allFunctionTypes) &&
                      allFunctionTypes
                        .sort((a, b) => a.GrCod.localeCompare(b.GrCod))
                        .map((ft) => (
                          <option key={ft.Fnc_Id} value={ft.Fnc_Id}>
                            {getIndentedGroupNameAndStyle(ft).name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  name="Fnc_Desc"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter function type Description"
                  required
                  autoFocus
                />
              </div>

              {/* Add Form - Action dropdown with search */}
              <div ref={actionDropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Action
                  </label>
                </div>
                <div className="relative">
                  <button
                    ref={actionButtonRef}
                    type="button"
                    onClick={() =>
                      setIsActionDropdownOpen(!isActionDropdownOpen)
                    }
                    onKeyDown={handleActionKeyDown}
                    className="pl-4 pr-10 block w-full py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left bg-white relative"
                    disabled={loadingState.fetchActions}
                  >
                    <span
                      className={`block truncate ${!selectedActionId ? "text-gray-400" : "text-gray-900"}`}
                    >
                      {getSelectedActionName()}
                    </span>
                  </button>

                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {isActionDropdownOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  {isActionDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                      {/* Search input */}
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            ref={actionSearchInputRef}
                            type="text"
                            value={actionSearchTerm}
                            onChange={(e) => {
                              setActionSearchTerm(e.target.value);
                              setActionHighlightedIndex(-1);
                            }}
                            onKeyDown={handleActionSearchKeyDown}
                            placeholder="Search actions..."
                            className="pl-9 pr-8 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          {actionSearchTerm && (
                            <button
                              type="button"
                              onClick={clearActionSearch}
                              className="absolute inset-y-0 right-0 pr-2 flex items-center"
                            >
                              <XCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action list */}
                      <div
                        ref={actionListRef}
                        className="overflow-y-auto max-h-60"
                      >
                        {loadingState.fetchActions ? (
                          <div className="px-4 py-8 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">
                              Loading actions...
                            </p>
                          </div>
                        ) : filterActions(actionSearchTerm).length > 0 ? (
                          filterActions(actionSearchTerm)
                            .sort((a, b) => a.stage.localeCompare(b.stage))
                            .map((action, idx) => {
                              const isSelected =
                                selectedActionId == action.Act_Id;
                              return (
                                <button
                                  key={action.Act_Id}
                                  ref={(el) => {
                                    actionItemRefs.current[idx] = el;
                                  }}
                                  type="button"
                                  onClick={() => handleActionSelect(action)}
                                  onKeyDown={(e) =>
                                    handleActionItemKeyDown(e, action, idx)
                                  }
                                  className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 ${
                                    actionHighlightedIndex == idx
                                      ? "bg-blue-100"
                                      : isSelected
                                        ? "bg-blue-100"
                                        : ""
                                  }`}
                                  tabIndex={0}
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">
                                      {action.stage}
                                    </span>
                                    {isSelected && (
                                      <div className="text-xs text-blue-600 mt-1 flex items-center">
                                        <Check className="h-3 w-3 mr-1" />
                                        Selected
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <p className="text-sm text-gray-500">
                              No actions found
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Try adjusting your search
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Results count */}
                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                        {filterActions(actionSearchTerm).length} action(s) found
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Select an initial action (Previous_Status: null) to
                  associate with this menu item
                </p>
              </div>

              {/* Quick Action Checkbox */}
              <div className="pt-2">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="Is_Quick_Action"
                      className="sr-only peer"
                      id="quick-action-add"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                    <Zap className="h-4 w-4 mr-1 text-amber-500" />
                    Quick Action
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Mark this menu item as a quick action for faster access
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  name="Fnc_Title"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter page Fnc_Title (max 100 characters)"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Page Fnc_Title for browser tab (max 100 characters)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Content
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <JoditEditor
                    ref={editor}
                    value={""}
                    config={config}
                    onBlur={(content) => {
                      const hiddenInput = document.querySelector(
                        'input[name="Description"]',
                      );
                      if (!hiddenInput) {
                        const form = document.querySelector("form");
                        const input = document.createElement("input");
                        input.type = "hidden";
                        input.name = "Description";
                        input.value = content;
                        form.appendChild(input);
                      } else {
                        hiddenInput.value = content;
                      }
                    }}
                    onChange={(content) => {
                      const hiddenInput = document.querySelector(
                        'input[name="Description"]',
                      );
                      if (!hiddenInput) {
                        const form = document.querySelector("form");
                        const input = document.createElement("input");
                        input.type = "hidden";
                        input.name = "Description";
                        input.value = content;
                        form.appendChild(input);
                      } else {
                        hiddenInput.value = content;
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Rich text content for the page
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Links
                </label>
                <div className="flex items-center">
                  <input
                    name="Menu_Links"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter menu link (optional)"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional URL for menu navigation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode Code
                </label>
                <input
                  type="text"
                  name="Mod_Code"
                  defaultValue={editFunctionType?.Mod_Code || ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mode code (optional, max 4 characters)"
                  maxLength={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Generate Voucher
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={selectedGvnNo}
                  onChange={(e) => setSelectedGvnNo(e.target.value)}
                >
                  <option value="">Select voucher format (optional)</option>
                  {genVoucherOptions.map((v) => (
                    <option key={v.gvn_no} value={v.gvn_no}>
                      {buildVoucherLabel(v)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Associate a voucher number format with this menu item
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormError(null);
                    setActionSearchTerm("");
                    setIsActionDropdownOpen(false);
                    setSelectedActionId("");
                    setSelectedGvnNo("");
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
                    : "Create Menu Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && editFunctionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowEditForm(null);
              setFormError(null);
              setEditActionSearchTerm("");
              setIsEditActionDropdownOpen(false);
              setSelectedEditActionId("");
              setSelectedEditGvnNo("");
            }}
          />
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Menu Item
              </h2>
              <button
                onClick={() => {
                  setShowEditForm(null);
                  setFormError(null);
                  setEditActionSearchTerm("");
                  setIsEditActionDropdownOpen(false);
                  setSelectedEditActionId("");
                  setSelectedEditGvnNo("");
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  name="Fnc_Desc"
                  defaultValue={editFunctionType.Fnc_Desc || ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter function type Description"
                  required
                  autoFocus
                />
              </div>

              {/* Edit Form - Action dropdown with search */}
              <div ref={editActionDropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Action
                  </label>
                </div>
                <div className="relative">
                  <button
                    ref={editActionButtonRef}
                    type="button"
                    onClick={() =>
                      setIsEditActionDropdownOpen(!isEditActionDropdownOpen)
                    }
                    onKeyDown={handleEditActionKeyDown}
                    className="pl-4 pr-10 block w-full py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left bg-white relative"
                    disabled={loadingState.fetchActions}
                  >
                    <span
                      className={`block truncate ${!selectedEditActionId ? "text-gray-400" : "text-gray-900"}`}
                    >
                      {getSelectedEditActionName()}
                    </span>
                  </button>

                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {isEditActionDropdownOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  {isEditActionDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                      {/* Search input */}
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            ref={editActionSearchInputRef}
                            type="text"
                            value={editActionSearchTerm}
                            onChange={(e) => {
                              setEditActionSearchTerm(e.target.value);
                              setEditActionHighlightedIndex(-1);
                            }}
                            onKeyDown={handleEditActionSearchKeyDown}
                            placeholder="Search actions..."
                            className="pl-9 pr-8 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          {editActionSearchTerm && (
                            <button
                              type="button"
                              onClick={clearEditActionSearch}
                              className="absolute inset-y-0 right-0 pr-2 flex items-center"
                            >
                              <XCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action list */}
                      <div
                        ref={editActionListRef}
                        className="overflow-y-auto max-h-60"
                      >
                        {loadingState.fetchActions ? (
                          <div className="px-4 py-8 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">
                              Loading actions...
                            </p>
                          </div>
                        ) : filterActions(editActionSearchTerm).length > 0 ? (
                          filterActions(editActionSearchTerm)
                            .sort((a, b) => a.stage.localeCompare(b.stage))
                            .map((action, idx) => {
                              const isSelected =
                                selectedEditActionId == action.Act_Id;
                              return (
                                <button
                                  key={action.Act_Id}
                                  ref={(el) => {
                                    editActionItemRefs.current[idx] = el;
                                  }}
                                  type="button"
                                  onClick={() => handleEditActionSelect(action)}
                                  onKeyDown={(e) =>
                                    handleEditActionItemKeyDown(e, action, idx)
                                  }
                                  className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 ${
                                    editActionHighlightedIndex == idx
                                      ? "bg-blue-100"
                                      : isSelected
                                        ? "bg-blue-100"
                                        : ""
                                  }`}
                                  tabIndex={0}
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">
                                      {action.stage}
                                    </span>
                                    {isSelected && (
                                      <div className="text-xs text-blue-600 mt-1 flex items-center">
                                        <Check className="h-3 w-3 mr-1" />
                                        Selected
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <p className="text-sm text-gray-500">
                              No actions found
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Try adjusting your search
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Results count */}
                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                        {filterActions(editActionSearchTerm).length} action(s)
                        found
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Select an initial action (Previous_Status: null) to
                  associate with this menu item
                </p>
              </div>

              {/* Quick Action Checkbox - Edit Form */}
              <div className="pt-2">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="Is_Quick_Action"
                      defaultChecked={
                        editFunctionType.Is_Quick_Action == true ||
                        editFunctionType.Is_Quick_Action == 1
                      }
                      className="sr-only peer"
                      id="quick-action-edit"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                    <Zap className="h-4 w-4 mr-1 text-amber-500" />
                    Quick Action
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Mark this menu item as a quick action for faster access
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  name="Fnc_Title"
                  defaultValue={editFunctionType.Fnc_Title || ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter page Fnc_Title (max 100 characters)"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Page Fnc_Title for browser tab (max 100 characters)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Content
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <JoditEditor
                    ref={editor}
                    value={editFunctionType.Description || ""}
                    config={config}
                    onBlur={(content) => {
                      const hiddenInput = document.querySelector(
                        'input[name="Description"]',
                      );
                      if (!hiddenInput) {
                        const form = document.querySelector("form");
                        const input = document.createElement("input");
                        input.type = "hidden";
                        input.name = "Description";
                        input.value = content;
                        form.appendChild(input);
                      } else {
                        hiddenInput.value = content;
                      }
                    }}
                    onChange={(content) => {
                      const hiddenInput = document.querySelector(
                        'input[name="Description"]',
                      );
                      if (!hiddenInput) {
                        const form = document.querySelector("form");
                        const input = document.createElement("input");
                        input.type = "hidden";
                        input.name = "Description";
                        input.value = content;
                        form.appendChild(input);
                      } else {
                        hiddenInput.value = content;
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Rich text content for the page
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Links
                </label>
                <div className="flex items-center">
                  <input
                    name="Menu_Links"
                    defaultValue={editFunctionType.Menu_Links || ""}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter menu link (optional)"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional URL for menu navigation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode Code
                </label>
                <input
                  type="text"
                  name="Mod_Code"
                  defaultValue={editFunctionType.Mod_Code || ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mode code (optional, max 4 characters)"
                  maxLength={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Generate Voucher
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={selectedEditGvnNo}
                  onChange={(e) => setSelectedEditGvnNo(e.target.value)}
                >
                  <option value="">Select voucher format (optional)</option>
                  {genVoucherOptions.map((v) => (
                    <option key={v.gvn_no} value={v.gvn_no}>
                      {buildVoucherLabel(v)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Associate a voucher number format with this menu item
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
                      id="visibility-toggle-edit"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Make this menu item visible
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Visible menu items will appear in the navigation
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(null);
                    setFormError(null);
                    setEditActionSearchTerm("");
                    setIsEditActionDropdownOpen(false);
                    setSelectedEditActionId("");
                    setSelectedEditGvnNo("");
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

      {/* Details Modal */}
      {showDetails && functionTypes.find((ft) => ft.Fnc_Id == showDetails) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetails(null)}
          />
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Menu Item Detail
              </h2>
              <button
                onClick={() => setShowDetails(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-6">
              {(() => {
                const functionType = functionTypes.find(
                  (ft) => ft.Fnc_Id == showDetails,
                );

                if (!functionType) return null;

                const { name } = getIndentedGroupNameAndStyle(functionType);

                const grshStatus =
                  functionType.GrStt == "1"
                    ? "Level 1"
                    : functionType.GrStt == "2"
                      ? "Level 2"
                      : functionType.GrStt == "3"
                        ? "Level 3"
                        : "Level 4";

                const actionDisplay = getActionDisplay(functionType);
                const actionDetails =
                  functionType?.action ||
                  (functionType?.Act_Id
                    ? actionTypes?.find((a) => a.Act_Id == functionType.Act_Id)
                    : null);

                return (
                  <>
                    <div className="flex items-center mb-4">
                      <div
                        className={`h-12 w-12 rounded-lg flex items-center justify-center mr-4 ${
                          functionType.GrStt == "1"
                            ? "bg-blue-100 text-blue-600"
                            : functionType.GrStt == "2"
                              ? "bg-green-100 text-green-600"
                              : functionType.GrStt == "3"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        <span className="text-lg font-bold">
                          L{functionType.GrStt}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ID: {functionType.Fnc_Id}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Group Code
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900 font-medium">
                            {functionType.GrCod}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Up Group
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
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
                            {functionType.GrSrn}
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
                              functionType.GrStt == "1"
                                ? "bg-blue-100 text-blue-800"
                                : functionType.GrStt == "2"
                                  ? "bg-green-100 text-green-800"
                                  : functionType.GrStt == "3"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            Level {functionType.GrStt}
                          </span>
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
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Action
                        </label>
                        <div className="mt-1">
                          {actionDisplay ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {actionDisplay}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm italic">
                              No action
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Quick Action
                        </label>
                        <div className="mt-1">
                          {functionType.Is_Quick_Action ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <Zap className="h-3 w-3 mr-1" />
                              Yes
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm italic">
                              No
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Generate Voucher
                        </label>
                        <div className="mt-1">
                          {functionType.gen_voucher_no ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 font-mono">
                              {buildVoucherLabel(functionType.gen_voucher_no)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm italic">
                              Not assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {actionDetails && (
                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <h3 className="text-md font-medium text-indigo-800 mb-2">
                          Action Details
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-indigo-700">
                              Stage:
                            </span>
                            <span className="ml-2 text-indigo-900">
                              {actionDetails?.stage || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-indigo-700">
                              Previous Status:
                            </span>
                            <span className="ml-2 text-indigo-900">
                              {actionDetails?.Previous_Status || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Page Title
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {functionType.Fnc_Title || (
                              <span className="text-gray-400 italic">
                                Not set
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Menu Links
                        </label>
                        <div className="mt-1">
                          {functionType.Menu_Links ? (
                            <div className="flex items-center">
                              <LinkIcon className="h-4 w-4 text-blue-500 mr-2" />
                              <span className="text-blue-600 text-sm">
                                {functionType.Menu_Links}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm italic">
                              No menu link
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Parent Function ID
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {functionType.Fnc_Id || "None"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {functionType.Description && (
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Page Content
                        </h3>
                        <div className="prose max-w-none bg-white p-6 rounded-lg border border-gray-200">
                          {parse(
                            DOMPurify.sanitize(functionType.Description, {
                              ADD_ATTR: ["style"],
                            }),
                          )}
                        </div>
                      </div>
                    )}

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
