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

import { useState, useEffect } from "react";
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
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function DepartmentMaster() {
  const navigate = useNavigate();
  const [functionTypes, setFunctionTypes] = useState([]);
  const [allFunctionTypes, setAllFunctionTypes] = useState([]);
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
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [formError, setFormError] = useState(null);
  const [pageTitle, setPageTitle] = useState("Department Management");

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/masters/organization-management/department-master";
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

  const isLoading = Object.values(loadingState).some((state) => state);

  // Helper function to get indented name for dropdown (same as MenuMaster)
  const getIndentedName = (functionType) => {
    const indentLevels = {
      1: "",
      2: "    ", // 4 non-breaking spaces
      3: "        ", // 8 non-breaking spaces
      4: "            ", // 12 non-breaking spaces
    };
    return `${indentLevels[functionType.GrStt] || ""}${functionType.Dpt_Desc}`;
  };

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
        isvisible: "1",
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
        isvisible: "1",
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
        isvisible: "1",
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
        isvisible: "1",
      };
    }

    return {
      GrCod: parentGrcod,
      GrSrn: "1",
      GrStt: "4",
      UpGrp: parentGrcod,
      isvisible: "1",
    };
  };

  const getFilteredFunctionTypes = () => {
    let filtered = functionTypes;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ft) =>
          ft.Dpt_Desc?.toLowerCase().includes(term) ||
          ft.Dpt_Name?.toLowerCase().includes(term) ||
          ft.GrCod?.toLowerCase().includes(term) ||
          ft.Dpt_id?.toString().includes(term),
      );
    }

    // If no items are expanded, show only top-level items (Level 1)
    if (expandedItems.size == 0) {
      return filtered.filter((ft) => ft.GrStt == "1");
    }

    const visibleItems = new Set();
    const itemsToShow = new Set();

    // Helper function to find children of a given item
    const findChildren = (item) => {
      const currentLevel = item.GrStt;
      const currentCode = item.GrCod;

      if (currentLevel == "1") {
        // Level 1 children are Level 2 items that start with the same first 2 digits
        return filtered.filter(
          (ft) =>
            ft.GrStt == "2" && ft.GrCod.startsWith(currentCode.substring(0, 2)),
        );
      } else if (currentLevel == "2") {
        // Level 2 children are Level 3 items that start with the same first 4 digits
        return filtered.filter(
          (ft) =>
            ft.GrStt == "3" && ft.GrCod.startsWith(currentCode.substring(0, 4)),
        );
      } else if (currentLevel == "3") {
        // Level 3 children are Level 4 items that start with the same first 6 digits
        return filtered.filter(
          (ft) =>
            ft.GrStt == "4" && ft.GrCod.startsWith(currentCode.substring(0, 6)),
        );
      }
      return [];
    };

    // Recursive function to add an item and all its expanded children
    const addItemAndChildren = (item) => {
      if (!item) return;

      itemsToShow.add(item.Dpt_id);

      // Find all direct children of this item
      const children = findChildren(item);

      children.forEach((child) => {
        itemsToShow.add(child.Dpt_id);
        // If this child is also expanded, add its children too
        if (expandedItems.has(child.Dpt_id)) {
          addItemAndChildren(child);
        }
      });
    };

    // Start with all Level 1 items
    filtered.forEach((item) => {
      if (item.GrStt == "1") {
        visibleItems.add(item.Dpt_id);

        // If this Level 1 item is expanded, add its children recursively
        if (expandedItems.has(item.Dpt_id)) {
          addItemAndChildren(item);
        }
      }
    });

    // Add any items that were found through recursion
    itemsToShow.forEach((id) => {
      visibleItems.add(id);
    });

    // Return all visible items sorted by GrCod
    return filtered
      .filter((ft) => visibleItems.has(ft.Dpt_id))
      .sort((a, b) => a.GrCod.localeCompare(b.GrCod));
  };

  const filteredFunctionTypes = getFilteredFunctionTypes();

  const stats = {
    total: functionTypes.length,
    level1: functionTypes.filter((ft) => ft.GrStt == "1").length,
    level2: functionTypes.filter((ft) => ft.GrStt == "2").length,
    level3: functionTypes.filter((ft) => ft.GrStt == "3").length,
    level4: functionTypes.filter((ft) => ft.GrStt == "4").length,
    visible: functionTypes.filter((ft) => ft.isvisible == "1").length,
    hidden: functionTypes.filter((ft) => ft.isvisible == "0").length,
  };

  const toggleExpand = (functionType) => {
    const newExpandedItems = new Set(expandedItems);
    if (expandedItems.has(functionType.Dpt_id)) {
      newExpandedItems.delete(functionType.Dpt_id);
    } else {
      newExpandedItems.add(functionType.Dpt_id);
    }
    setExpandedItems(newExpandedItems);
  };

  const hasChildren = (functionType) => {
    const currentLevel = functionType.GrStt;
    const currentCode = functionType.GrCod;

    // Level 1 children (Level 2) - check for items with GrStt "2" that start with first 2 digits
    if (currentLevel == "1") {
      const prefix = currentCode.substring(0, 2);
      return functionTypes.some(
        (ft) =>
          ft.GrStt == "2" &&
          ft.GrCod.startsWith(prefix) &&
          ft.Dpt_id != functionType.Dpt_id,
      );
    }

    // Level 2 children (Level 3) - check for items with GrStt "3" that start with first 4 digits
    else if (currentLevel == "2") {
      const prefix = currentCode.substring(0, 4);
      return functionTypes.some(
        (ft) =>
          ft.GrStt == "3" &&
          ft.GrCod.startsWith(prefix) &&
          ft.Dpt_id != functionType.Dpt_id,
      );
    }

    // Level 3 children (Level 4) - check for items with GrStt "4" that start with first 6 digits
    else if (currentLevel == "3") {
      const prefix = currentCode.substring(0, 6);
      return functionTypes.some(
        (ft) =>
          ft.GrStt == "4" &&
          ft.GrCod.startsWith(prefix) &&
          ft.Dpt_id != functionType.Dpt_id,
      );
    }

    // Level 4 has no children (max level)
    return false;
  };

  const getIndentedGroupNameAndStyle = (functionType) => {
    const indentLevels = {
      1: "",
      2: "    ",
      3: "        ",
      4: "            ",
    };
    const rowStyles = {
      1: "bg-blue-50",
      2: "bg-green-50",
      3: "bg-yellow-50",
      4: "bg-purple-50",
    };

    const opacityClass = functionType.isvisible == "0" ? "opacity-60" : "";

    return {
      name: `${indentLevels[functionType.GrStt] || ""}${functionType.Dpt_Desc}`,
      rowClass: `${
        rowStyles[functionType.GrStt] || "bg-gray-50"
      } ${opacityClass}`,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingState((prev) => ({ ...prev, initialFetch: true }));
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
           {
                  headers: {
                                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
                  }
             }
        );

        const funcTypesData = response.data.data || response.data;
        const sortedFuncTypes = Array.isArray(funcTypesData)
          ? funcTypesData.sort((a, b) => a.GrCod.localeCompare(b.GrCod))
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

  const handleAddFunctionType = async (e) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const Dpt_id = formData.get("Dpt_id");
    const Dpt_Desc = formData.get("Dpt_Desc");
    const Dpt_Name = formData.get("Dpt_Name");
    const isvisible = "1";

    if (!Dpt_Desc) {
      setFormError("Description is required.");
      return;
    }

    try {
      setLoadingState((prev) => ({ ...prev, addFunctionType: true }));

      const parentFunction = allFunctionTypes.find((ft) => ft.Dpt_id == Dpt_id);
      const newGroupCode = getNextGroupCode(parentFunction);

      const newFunctionType = {
        Dpt_Desc,
        Dpt_Name: Dpt_Name || null,
        ...newGroupCode,
        Dpt_id: Dpt_id || null,
        isvisible: isvisible,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/dpt-master`,
        newFunctionType,
         {
                  headers: {
                                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
                  }
          }
      );

      if (response.data.success == true) {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
           {
                  headers: {
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
        toast.success("Department added successfully!");
      } else {
        setFormError(response.data.message || "Failed to add department.");
      }
    } catch (error) {
      console.error("Error adding department:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to add department. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, addFunctionType: false }));
    }
  };

  const handleEdit = (functionType) => {
    setEditFunctionType(functionType);
    setShowEditForm(functionType.Dpt_id);
    setFormError(null);
  };

  const handleUpdateFunctionType = async (e) => {
    e.preventDefault();
    if (!editFunctionType) return;

    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const Dpt_Desc = formData.get("Dpt_Desc");
    const Dpt_Name = formData.get("Dpt_Name");
    const isvisible = formData.get("isvisible") == "on" ? "1" : "0";

    if (!Dpt_Desc) {
      setFormError("Description is required.");
      return;
    }

    const updatedFunctionType = {
      Dpt_Desc: Dpt_Desc || editFunctionType.Dpt_Desc,
      Dpt_Name: Dpt_Name == "" ? null : Dpt_Name,
      UpGrp: editFunctionType.UpGrp,
      GrCod: editFunctionType.GrCod,
      GrSrn: editFunctionType.GrSrn,
      GrStt: editFunctionType.GrStt,
      Dpt_id: editFunctionType.Dpt_id,
      isvisible: isvisible,
    };

    try {
      setLoadingState((prev) => ({ ...prev, updateFunctionType: true }));
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/dpt-master/${editFunctionType.Dpt_id}`,
        updatedFunctionType,
         {
                  headers: {
                                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
                  }
             }
      );

      if (response.data.success == true) {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
           {
                    headers: {
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
        toast.success("Department updated successfully!");
      } else {
        setFormError(response.data.message || "Failed to update department.");
      }
    } catch (error) {
      console.error("Error updating department:", error);
      setFormError(
        error.response?.data?.message ||
          "Failed to update department. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, updateFunctionType: false }));
    }
  };

  const handleDeleteFunctionType = async (Dpt_id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      setLoadingState((prev) => ({ ...prev, deleteFunctionType: true }));
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/dpt-master/${Dpt_id}`,
         {
                  headers: {
                                "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
                  }
             }
      );

      if (response.data.success == true) {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
           {
                  headers: {
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

        toast.success("Department deleted successfully!");
      } else {
        toast.error(response.data.message || "Failed to delete department.");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete department. Please try again.",
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, deleteFunctionType: false }));
    }
  };

  const handleToggleVisibility = async (functionType) => {
    try {
      setLoadingState((prev) => ({ ...prev, toggleVisibility: true }));

      const newVisibility = functionType.isvisible == "1" ? "0" : "1";

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/dpt-master/${functionType.Dpt_id}`,
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

      if (response.data.success == true) {
        const refreshResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
           {
                  headers: {
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
          `Department item ${
            newVisibility == "1" ? "made visible" : "hidden"
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
    setShowDetails(functionType.Dpt_id);
  };

  const handleRefresh = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, filterFunctionType: true }));
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
         {
                  headers: {
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
      setSearchTerm("");

      toast.success("Data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data. Please try again.");
    } finally {
      setLoadingState((prev) => ({ ...prev, filterFunctionType: false }));
    }
  };

  const handleBulkToggleVisibility = async () => {
    if (selectedItems.length == 0) {
      toast.error("No departments selected");
      return;
    }

    try {
      setLoadingState((prev) => ({ ...prev, toggleVisibility: true }));

      for (const id of selectedItems) {
        const item = functionTypes.find((ft) => ft.Dpt_id == id);
        if (item) {
          const newVisibility = item.isvisible == "1" ? "0" : "1";
          await axios.put(`${import.meta.env.VITE_API_URL}/dpt-master/${id}`, {
            ...item,
            isvisible: newVisibility,
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
            }
          });
        }
      }

      const refreshResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
         {
                  headers: {
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
      setSelectedItems([]);

      toast.success(
        `${selectedItems.length} departments updated successfully!`,
      );
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to update some departments");
    } finally {
      setLoadingState((prev) => ({ ...prev, toggleVisibility: false }));
    }
  };

  if (isLoading && loadingState.initialFetch) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading departments...</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-colors"
            disabled={loadingState.filterFunctionType}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loadingState.filterFunctionType ? "animate-spin" : ""}`}
            />
            {loadingState.filterFunctionType ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-lg font-medium flex items-center transition-all shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Add Department
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">Total Department</p>
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
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={
                      selectedItems.length == filteredFunctionTypes.length &&
                      filteredFunctionTypes.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(
                          filteredFunctionTypes.map((ft) => ft.Dpt_id),
                        );
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                  />
                </th>
                <th className="w-16 px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Expand
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department Name(English)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Group Codes
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status (GrStt)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Visibility
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFunctionTypes.length > 0 ? (
                filteredFunctionTypes.map((functionType) => {
                  const { name, rowClass } =
                    getIndentedGroupNameAndStyle(functionType);
                  const isExpanded = expandedItems.has(functionType.Dpt_id);
                  const showExpandIcon = hasChildren(functionType);

                  const grshStatus =
                    functionType.GrStt == "1"
                      ? "Level 1"
                      : functionType.GrStt == "2"
                        ? "Level 2"
                        : functionType.GrStt == "3"
                          ? "Level 3"
                          : "Level 4";

                  return (
                    <tr
                      key={functionType.Dpt_id}
                      className={`hover:bg-gray-50 transition-colors ${rowClass}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          checked={selectedItems.includes(functionType.Dpt_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([
                                ...selectedItems,
                                functionType.Dpt_id,
                              ]);
                            } else {
                              setSelectedItems(
                                selectedItems.filter(
                                  (Dpt_id) => Dpt_id != functionType.Dpt_id,
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
                              {functionType.isvisible == "0" && (
                                <span className="ml-2 text-xs text-gray-500 italic">
                                  (Hidden)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {functionType.Dpt_Name ? (
                          <div className="text-sm text-gray-700">
                            {functionType.Dpt_Name}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            No department name(english)
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
                          className={`p-1.5 rounded transition-colors ${
                            functionType.isvisible == "1"
                              ? "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                          title={
                            functionType.isvisible == "1" ? "Hide" : "Show"
                          }
                          disabled={loadingState.toggleVisibility}
                        >
                          {functionType.isvisible == "1" ? (
                            <EyeVisible className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
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
                                functionType.Dpt_id,
                                functionType.Dpt_Desc,
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FolderTree className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm
                          ? "No departments found"
                          : "No departments yet"}
                      </h3>
                      <p className="text-gray-600 max-w-md mb-6">
                        {searchTerm
                          ? "No departments match your search criteria. Try adjusting your search term."
                          : "Get started by adding your first department to the hierarchy."}
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Department
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

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {selectedItems.length}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-blue-800">
                {selectedItems.length} department(s) selected
              </span>
              <p className="text-xs text-blue-600">
                Choose an action for selected items
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleBulkToggleVisibility}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center"
            >
              <EyeVisible className="h-4 w-4 mr-2" />
              Toggle Visibility
            </button>
            <button
              onClick={() => setSelectedItems([])}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              setFormError(null);
            }}
          />
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Add New Department
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Department
                </label>
                <div className="relative">
                  <select
                    name="Dpt_id"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select Parent Department</option>
                    {Array.isArray(allFunctionTypes) &&
                      allFunctionTypes
                        .sort((a, b) => a.GrCod.localeCompare(b.GrCod))
                        .map((ft) => (
                          <option key={ft.Dpt_id} value={ft.Dpt_id}>
                            {getIndentedName(ft)} ({ft.GrCod})
                          </option>
                        ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select a parent department to create a sub-department (can be
                  any level)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="Dpt_Desc"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter department description"
                  required
                  autoFocus
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Descriptive name for the department
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name(English)
                </label>
                <div className="flex items-center">
                  <input
                    name="Dpt_Name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter department name (English)"
                    maxLength={100}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: English name for the department
                </p>
              </div>

              <input type="hidden" name="isvisible" value="1" />

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormError(null);
                  }}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loadingState.addFunctionType}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-sm"
                  disabled={loadingState.addFunctionType}
                >
                  {loadingState.addFunctionType
                    ? "Creating..."
                    : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditForm && editFunctionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowEditForm(null);
              setFormError(null);
            }}
          />
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Department
              </h2>
              <button
                onClick={() => {
                  setShowEditForm(null);
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Department
                </label>
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                  {editFunctionType.UpGrp &&
                  editFunctionType.UpGrp != editFunctionType.GrCod ? (
                    (() => {
                      const parent = allFunctionTypes.find(
                        (ft) => ft.GrCod == editFunctionType.UpGrp,
                      );
                      return parent
                        ? `${getIndentedName(parent)} (${parent.GrCod})`
                        : editFunctionType.UpGrp;
                    })()
                  ) : (
                    <span className="text-gray-400 italic">
                      No parent (Top Level)
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Parent cannot be changed after creation (hierarchy is fixed)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="Dpt_Desc"
                  defaultValue={editFunctionType.Dpt_Desc}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter department description"
                  required
                  autoFocus
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name(English)
                </label>
                <div className="flex items-center">
                  <input
                    name="Dpt_Name"
                    defaultValue={editFunctionType.Dpt_Name || ""}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter department name (English)"
                    maxLength={100}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Optional: English name for the department
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isvisible"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    defaultChecked={editFunctionType.isvisible == "1"}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Department is visible
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Uncheck to hide this department from users
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(null);
                    setFormError(null);
                  }}
                  className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loadingState.updateFunctionType}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-sm"
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
      {showDetails && functionTypes.find((ft) => ft.Dpt_id == showDetails) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetails(null)}
          />
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Department Details
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
                  (ft) => ft.Dpt_id == showDetails,
                );
                const { name } = getIndentedGroupNameAndStyle(functionType);

                const grshStatus =
                  functionType.GrStt == "1"
                    ? "Level 1"
                    : functionType.GrStt == "2"
                      ? "Level 2"
                      : functionType.GrStt == "3"
                        ? "Level 3"
                        : "Level 4";

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
                          ID: {functionType.Dpt_id}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Group Code
                          </label>
                          <div className="mt-1">
                            <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                              {functionType.GrCod}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Up Group
                          </label>
                          <div className="mt-1">
                            <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
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
                      </div>

                      <div className="space-y-4">
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
                              {grshStatus}
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
                                functionType.isvisible == "1"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {functionType.isvisible == "1" ? (
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
                            Parent Department ID
                          </label>
                          <div className="mt-1">
                            <span className="text-gray-900">
                              {functionType.Dpt_id || "None"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Department Name(English)
                      </label>
                      <div className="mt-1">
                        {functionType.Dpt_Name ? (
                          <div className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">
                            {functionType.Dpt_Name}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic bg-gray-50 p-3 rounded-lg block">
                            No department name(english) provided
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
                            {new Date(
                              functionType.created_at,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Updated At
                        </label>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            {new Date(
                              functionType.updated_at,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-4">
                      <button
                        onClick={() => setShowDetails(null)}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
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
