import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  Calendar,
  Briefcase,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import axios from "axios";
import { HolidayDesgMapApi } from "../../../services/holidaydesgmapapi";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

const AddEditHolidayDesgMapping = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // State for dropdown options
  const [holidays, setHolidays] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Search and filter states for holidays
  const [holidaySearchTerm, setHolidaySearchTerm] = useState("");
  const [filteredHolidays, setFilteredHolidays] = useState([]);
  const [isHolidayDropdownOpen, setIsHolidayDropdownOpen] = useState(false);
  const holidayDropdownRef = useRef(null);

  // Search and filter states for designations
  const [desgSearchTerm, setDesgSearchTerm] = useState("");
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  const [isDesgDropdownOpen, setIsDesgDropdownOpen] = useState(false);
  const desgDropdownRef = useRef(null);

  // State for expanded nodes in designation tree
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const [formData, setFormData] = useState({
    HL_Id: "",
    Dsg_Id: "",
    HDS_Status: true, // Default to active
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        holidayDropdownRef.current &&
        !holidayDropdownRef.current.contains(event.target)
      ) {
        setIsHolidayDropdownOpen(false);
      }
      if (
        desgDropdownRef.current &&
        !desgDropdownRef.current.contains(event.target)
      ) {
        setIsDesgDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sort designations by ID in ascending order
  const sortDesignationsById = (desgList) => {
    return [...desgList].sort((a, b) => {
      const idA = a.Dsg_id || a.id || 0;
      const idB = b.Dsg_id || b.id || 0;
      return idA - idB;
    });
  };

  // Build hierarchical tree from flat designations list with sorted children
  const buildDesignationTree = (desgList) => {
    const map = new Map();

    // First pass: create map of all items
    desgList.forEach((desg) => {
      const id = desg.Dsg_id || desg.id;
      map.set(id, {
        ...desg,
        children: [],
        level: 0,
      });
    });

    // Second pass: build tree structure
    const rootNodes = [];
    desgList.forEach((desg) => {
      const id = desg.Dsg_id || desg.id;
      const parentId = desg.Dsg_parent_id || desg.parent_id || null;
      const node = map.get(id);

      if (parentId && map.has(parentId)) {
        // Add as child to parent
        const parent = map.get(parentId);
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        // Root level node
        rootNodes.push(node);
      }
    });

    // Sort children by ID in ascending order for each parent
    const sortChildren = (nodes) => {
      nodes.sort((a, b) => {
        const idA = a.Dsg_id || a.id || 0;
        const idB = b.Dsg_id || b.id || 0;
        return idA - idB;
      });

      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortChildren(node.children);
        }
      });
    };

    sortChildren(rootNodes);
    return rootNodes;
  };

  // Filter tree nodes based on search term
  const filterTreeNodes = (nodes, term) => {
    if (!term.trim()) return nodes;

    const filtered = [];

    const searchInNode = (node) => {
      const matches =
        (node.Dsg_Title || node.title || node.name || "")
          .toLowerCase()
          .includes(term) ||
        (node.Dsg_Desc || node.description || "")
          .toLowerCase()
          .includes(term) ||
        (node.Dsg_EName || node.english_name || "")
          .toLowerCase()
          .includes(term) ||
        (node.GrCod || node.code || "").toLowerCase().includes(term);

      if (matches) {
        return true;
      }

      // Check children
      if (node.children && node.children.length > 0) {
        const childMatches = node.children.some((child) => searchInNode(child));
        if (childMatches) {
          return true;
        }
      }

      return false;
    };

    const buildFilteredTree = (node) => {
      if (searchInNode(node)) {
        const newNode = { ...node };
        if (node.children && node.children.length > 0) {
          newNode.children = node.children
            .map((child) => buildFilteredTree(child))
            .filter((child) => child != null)
            .sort((a, b) => {
              const idA = a.Dsg_id || a.id || 0;
              const idB = b.Dsg_id || b.id || 0;
              return idA - idB;
            });
        }
        return newNode;
      }
      return null;
    };

    nodes.forEach((node) => {
      const filteredNode = buildFilteredTree(node);
      if (filteredNode) {
        filtered.push(filteredNode);
      }
    });

    // Sort root nodes by ID
    filtered.sort((a, b) => {
      const idA = a.Dsg_id || a.id || 0;
      const idB = b.Dsg_id || b.id || 0;
      return idA - idB;
    });

    return filtered;
  };

  // Toggle node expansion
  const toggleNode = (nodeId, event) => {
    event.stopPropagation();
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Expand all nodes when searching
  useEffect(() => {
    if (desgSearchTerm.trim()) {
      // When searching, expand all nodes that contain matching items
      const expandMatchingNodes = (nodes) => {
        const idsToExpand = new Set();

        const traverse = (node) => {
          const matches =
            (node.Dsg_Title || node.title || node.name || "")
              .toLowerCase()
              .includes(desgSearchTerm.toLowerCase()) ||
            (node.Dsg_Desc || node.description || "")
              .toLowerCase()
              .includes(desgSearchTerm.toLowerCase()) ||
            (node.Dsg_EName || node.english_name || "")
              .toLowerCase()
              .includes(desgSearchTerm.toLowerCase()) ||
            (node.GrCod || node.code || "")
              .toLowerCase()
              .includes(desgSearchTerm.toLowerCase());

          if (matches) {
            // Add all ancestors
            let parent = node;
            while (parent) {
              idsToExpand.add(parent.Dsg_id || parent.id);
              parent = parent.parent;
            }
          }

          if (node.children) {
            node.children.forEach((child) => {
              child.parent = node; // Set parent reference for ancestor traversal
              traverse(child);
            });
          }
        };

        nodes.forEach((node) => traverse(node));
        return idsToExpand;
      };

      const tree = buildDesignationTree(designations);
      const idsToExpand = expandMatchingNodes(tree);
      setExpandedNodes(idsToExpand);
    } else {
      setExpandedNodes(new Set());
    }
  }, [desgSearchTerm, designations]);

  // Filter designations when search term changes
  useEffect(() => {
    if (!desgSearchTerm.trim()) {
      setFilteredDesignations(buildDesignationTree(designations));
    } else {
      const term = desgSearchTerm.toLowerCase();
      const tree = buildDesignationTree(designations);
      const filtered = filterTreeNodes(tree, term);
      setFilteredDesignations(filtered);
    }
  }, [desgSearchTerm, designations]);

  // Filter holidays when search term changes
  useEffect(() => {
    if (!holidaySearchTerm.trim()) {
      setFilteredHolidays(holidays);
    } else {
      const term = holidaySearchTerm.toLowerCase();
      const filtered = holidays.filter(
        (holiday) =>
          holiday.HL_Name?.toLowerCase().includes(term) ||
          holiday.HL_Code?.toLowerCase().includes(term) ||
          holiday.HL_Date?.includes(term),
      );
      setFilteredHolidays(filtered);
    }
  }, [holidaySearchTerm, holidays]);

  // Fetch dropdown options (Holidays and Designations)
  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    setFetchError(null);

    try {
      // Fetch holiday
      const holidaysResponse = await axios.get(`${API_BASE_URL}/holiday/all`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
      });

 
      // Fetch designations
      const designationsResponse = await axios.get(
        `${API_BASE_URL}/designation/all`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
          },
        },
      );

      // Extract holidays data with multiple format support
      let holidaysData = [];
      if (
        holidaysResponse.data?.data &&
        Array.isArray(holidaysResponse.data.data)
      ) {
        holidaysData = holidaysResponse.data.data;
      } else if (Array.isArray(holidaysResponse.data)) {
        holidaysData = holidaysResponse.data;
      } else if (
        holidaysResponse.data?.holidays &&
        Array.isArray(holidaysResponse.data.holidays)
      ) {
        holidaysData = holidaysResponse.data.holidays;
      } else if (
        holidaysResponse.data?.records &&
        Array.isArray(holidaysResponse.data.records)
      ) {
        holidaysData = holidaysResponse.data.records;
      }

      // Extract designations data with multiple format support
      let designationsData = [];
      if (
        designationsResponse.data?.data &&
        Array.isArray(designationsResponse.data.data)
      ) {
        designationsData = designationsResponse.data.data;
      } else if (Array.isArray(designationsResponse.data)) {
        designationsData = designationsResponse.data;
      } else if (
        designationsResponse.data?.designations &&
        Array.isArray(designationsResponse.data.designations)
      ) {
        designationsData = designationsResponse.data.designations;
      } else if (
        designationsResponse.data?.records &&
        Array.isArray(designationsResponse.data.records)
      ) {
        designationsData = designationsResponse.data.records;
      }

      // Sort designations by ID in ascending order
      designationsData = sortDesignationsById(designationsData);

      setHolidays(holidaysData);
      setFilteredHolidays(holidaysData);

      setDesignations(designationsData);

      // Build initial tree with sorted data
      const tree = buildDesignationTree(designationsData);
      setFilteredDesignations(tree);

      if (designationsData.length == 0) {
        setFetchError("No designations available");
        toast.error("No designations found. Please add designations first.");
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      let errorMessage = "Failed to load options";
      if (error.response?.status == 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status == 404) {
        errorMessage = "API endpoint not found. Check API URL.";
      } else if (error.response?.status == 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (id && id != "create") {
      setIsEditMode(true);
      loadMappingData();
    }
  }, [id]);

  const loadMappingData = async () => {
    setLoading(true);
    try {
      const mapping = await HolidayDesgMapApi.getById(id);

      setFormData({
        HL_Id: mapping.HL_Id?.toString() || "",
        Dsg_Id: mapping.Dsg_Id?.toString() || "",
        HDS_Status: mapping.HDS_Status == true || mapping.HDS_Status == 1,
      });
    } catch (error) {
      console.error("Error loading mapping:", error);
      toast.error("Failed to load mapping data!");
      navigate("/masters/leave-time-master/holiday-desg-mapping");
    } finally {
      setLoading(false);
    }
  };

  const handleHolidaySelect = (holidayId) => {
    setFormData((prev) => ({
      ...prev,
      HL_Id: holidayId.toString(),
    }));
    setIsHolidayDropdownOpen(false);
    setHolidaySearchTerm("");

    if (errors.HL_Id) {
      setErrors((prev) => ({ ...prev, HL_Id: "" }));
    }
  };

  const handleDesignationSelect = (desgId) => {
    setFormData((prev) => ({
      ...prev,
      Dsg_Id: desgId.toString(),
    }));
    setIsDesgDropdownOpen(false);
    setDesgSearchTerm("");

    if (errors.Dsg_Id) {
      setErrors((prev) => ({ ...prev, Dsg_Id: "" }));
    }
  };

  const getSelectedHolidayName = () => {
    if (!formData.HL_Id) return "";
    const selected = holidays.find(
      (h) => h.HL_Id?.toString() == formData.HL_Id,
    );
    if (!selected) return "Selected holiday not found";
    return `${selected.HL_Name || "Holiday"} ${selected.HL_Date ? `(${selected.HL_Date})` : ""}`;
  };

  const getDesignationDisplayText = (desg) => {
    if (!desg) return "Unknown";

    // Try different possible field names
    const title = desg.Dsg_Title || desg.title || desg.name || "";
    const eName = desg.Dsg_EName || desg.english_name || "";
    const desc = desg.Dsg_Desc || desg.description || "";
    const code = desg.GrCod || desg.code || "";
    const id = desg.Dsg_id || desg.id;

    if (title) {
      let display = title;
      if (eName) display += ` - ${eName}`;
      if (code) display += ` (${code})`;
      return display;
    }
    if (eName) return eName;
    if (desc) return desc;
    return `Designation #${id}`;
  };

  const getSelectedDesignationName = () => {
    if (!formData.Dsg_Id) return "";
    const selected = designations.find(
      (d) => (d.Dsg_id || d.id)?.toString() == formData.Dsg_Id,
    );
    return selected
      ? getDesignationDisplayText(selected)
      : "Selected designation not found";
  };

  // Render designation tree node recursively
  const renderDesignationNode = (node) => {
    const nodeId = node.Dsg_id || node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(nodeId);
    const isSelected = formData.Dsg_Id == nodeId?.toString();

    return (
      <div key={nodeId} className="select-none">
        <div
          className={`flex items-center w-full px-4 py-2 hover:bg-gray-50 cursor-pointer ${
            isSelected ? "bg-purple-50" : ""
          }`}
          style={{ paddingLeft: `${node.level * 20 + 16}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => toggleNode(nodeId, e)}
              className="mr-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="w-5 mr-1" />
          )}

          <button
            type="button"
            onClick={() => handleDesignationSelect(nodeId)}
            className="flex-1 text-left"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${isSelected ? "text-purple-600 font-medium" : "text-gray-700"}`}
              >
                {getDesignationDisplayText(node)}
              </span>
              {isSelected && <Check className="h-4 w-4 text-purple-600" />}
            </div>

            {/* Additional info */}
            {(node.Dsg_Desc || node.description || node.GrCod) && (
              <div className="text-xs text-gray-500 mt-0.5">
                {node.Dsg_Desc || node.description}
                {node.GrCod && ` • Code: ${node.GrCod}`}
              </div>
            )}
          </button>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="children-container">
            {node.children.map((child) => renderDesignationNode(child))}
          </div>
        )}
      </div>
    );
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.HL_Id) {
      newErrors.HL_Id = "Please select a holiday";
    }
    if (!formData.Dsg_Id) {
      newErrors.Dsg_Id = "Please select a designation";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if mapping already exists
    if (!isEditMode) {
      try {
        const exists = await HolidayDesgMapApi.checkExists(
          formData.HL_Id,
          formData.Dsg_Id,
        );
        if (exists) {
          toast.error("This holiday-designation mapping already exists!");
          return;
        }
      } catch (error) {
        console.error("Error checking existence:", error);
      }
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Mapping?" : "Create New Mapping?",
      text: isEditMode
        ? "Are you sure you want to update this mapping?"
        : "Are you sure you want to create this mapping?",
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
      const payload = {
        HL_Id: parseInt(formData.HL_Id),
        Dsg_Id: parseInt(formData.Dsg_Id),
        HDS_Status: formData.HDS_Status ? 1 : 0,
      };

      if (isEditMode) {
        await HolidayDesgMapApi.update(id, payload);
        toast.success("Mapping updated successfully!");
      } else {
        await HolidayDesgMapApi.create(payload);
        toast.success("Mapping created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/leave-time-master/holiday-desg-mapping");
      }, 1500);
    } catch (error) {
      console.error("Error saving mapping:", error);

      // Handle validation errors
      if (error.errors) {
        const newErrors = {};
        Object.keys(error.errors).forEach((key) => {
          newErrors[key] = Array.isArray(error.errors[key])
            ? error.errors[key][0]
            : error.errors[key];
        });
        setErrors(newErrors);
        toast.error("Please fix the validation errors");
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(
          isEditMode
            ? "Failed to update mapping."
            : "Failed to create mapping.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/leave-time-master/holiday-desg-mapping");
  };

  const handleRetry = () => {
    fetchOptions();
  };

  if (loading || loadingOptions) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {loading ? "Loading mapping data..." : "Loading options..."}
        </p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-12 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Data
        </h3>
        <p className="text-gray-600 mb-4">{fetchError}</p>
        <button
          onClick={handleRetry}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/leave-time-master/holiday-desg-mapping")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Mapping" : "Add New Mapping"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update holiday designation mapping"
                : "Create a new holiday designation mapping"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mapping Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Info className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Mapping Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Holiday Selection with Search */}
            <div ref={holidayDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holiday <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />

                <button
                  type="button"
                  onClick={() =>
                    setIsHolidayDropdownOpen(!isHolidayDropdownOpen)
                  }
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.HL_Id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-left bg-white`}
                >
                  {formData.HL_Id ? (
                    <span className="text-gray-900">
                      {getSelectedHolidayName()}
                    </span>
                  ) : (
                    <span className="text-gray-500">Select a holiday</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setIsHolidayDropdownOpen(!isHolidayDropdownOpen)
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>

                {errors.HL_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Holiday Dropdown Menu */}
              {isHolidayDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={holidaySearchTerm}
                        onChange={(e) => setHolidaySearchTerm(e.target.value)}
                        placeholder="Search by holiday name, code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        autoFocus
                      />
                      {holidaySearchTerm && (
                        <button
                          type="button"
                          onClick={() => setHolidaySearchTerm("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Holiday List */}
                  <div className="overflow-y-auto max-h-64">
                    {filteredHolidays.length > 0 ? (
                      filteredHolidays.map((holiday) => (
                        <button
                          key={holiday.HL_Id || holiday.id}
                          type="button"
                          onClick={() =>
                            handleHolidaySelect(holiday.HL_Id || holiday.id)
                          }
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 ${
                            formData.HL_Id ==
                            (holiday.HL_Id || holiday.id)?.toString()
                              ? "bg-purple-50 text-purple-600"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="font-medium">
                            {holiday.HL_Name || holiday.name || "Holiday"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex justify-between">
                            <span>
                              Date: {holiday.HL_Date || holiday.date || "N/A"}
                            </span>
                            {holiday.HL_Code && (
                              <span>Code: {holiday.HL_Code}</span>
                            )}
                          </div>
                          {formData.HL_Id ==
                            (holiday.HL_Id || holiday.id)?.toString() && (
                            <div className="text-xs text-purple-600 mt-1 flex items-center">
                              <Check className="h-3 w-3 mr-1" />
                              Selected
                            </div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                        <p>No holidays found</p>
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{filteredHolidays.length} holidays found</span>
                      <span>Total: {holidays.length} holidays</span>
                    </div>
                  </div>
                </div>
              )}

              {errors.HL_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.HL_Id}
                </p>
              )}
            </div>

            {/* Designation Selection with Hierarchical Tree */}
            <div ref={desgDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />

                <button
                  type="button"
                  onClick={() => setIsDesgDropdownOpen(!isDesgDropdownOpen)}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.Dsg_Id ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-left bg-white`}
                >
                  {formData.Dsg_Id ? (
                    <span className="text-gray-900">
                      {getSelectedDesignationName()}
                    </span>
                  ) : (
                    <span className="text-gray-500">Select a designation</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDesgDropdownOpen(!isDesgDropdownOpen)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>

                {errors.Dsg_Id && (
                  <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>

              {/* Designation Dropdown Menu with Tree View */}
              {isDesgDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={desgSearchTerm}
                        onChange={(e) => setDesgSearchTerm(e.target.value)}
                        placeholder="Search by title, name, description, code..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        autoFocus
                      />
                      {desgSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setDesgSearchTerm("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {desgSearchTerm ? "Showing matching results" : ""}
                    </p>
                  </div>

                  {/* Designation Tree */}
                  <div className="overflow-y-auto max-h-64">
                    {filteredDesignations.length > 0 ? (
                      filteredDesignations.map((node) =>
                        renderDesignationNode(node),
                      )
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
                      <span>{designations.length} total designations</span>
                      {desgSearchTerm && (
                        <span>
                          {filteredDesignations.reduce((acc, node) => {
                            const count = (node) => {
                              let c = 1;
                              if (node.children) {
                                c += node.children.reduce(
                                  (sum, child) => sum + count(child),
                                  0,
                                );
                              }
                              return c;
                            };
                            return acc + count(node);
                          }, 0)}{" "}
                          results
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      Sorted by ID (ascending)
                    </div>
                  </div>
                </div>
              )}

              {errors.Dsg_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Dsg_Id}
                </p>
              )}
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Designation cannot be changed in edit mode
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="HDS_Status"
                    checked={formData.HDS_Status == true}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, HDS_Status: true }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="HDS_Status"
                    checked={formData.HDS_Status == false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, HDS_Status: false }))
                    }
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <span className="text-xs text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </span>
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
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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

export default AddEditHolidayDesgMapping;
