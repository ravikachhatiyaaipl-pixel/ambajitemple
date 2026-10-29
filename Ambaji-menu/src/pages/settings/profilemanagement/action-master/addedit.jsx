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
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  GitMerge,
  Hash,
  Check,
  AlertCircle,
  Users,
  UserCheck,
  FileText,
  Briefcase,
  Layers,
  Building,
  Search,
  XCircle,
  ChevronDown,
  Loader,
  ToggleLeft,
  ToggleRight,
  Send,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { ActionMasterApi } from "../../../services/actionmasterapi";
import axios from "axios";

// =============  SEARCHABLE DROPDOWN COMPONENT ==============
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
  getId = (item) => item?.id,
  disabled = false,
  renderItem,
  multiple = false,
  selectedItems = [],
  onToggleItem,
  onSelectAll,
  onClearAll,
  showSelectAll = false,
}) => {
  const handleWheel = (e) => {
    e.stopPropagation();
  };

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
          } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-left ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          } transition-colors`}
        >
          {multiple ? (
            selectedItems.length > 0 ? (
              <span className="text-gray-900 truncate block">
                {selectedItems.length} selected
              </span>
            ) : (
              <span className="text-gray-500">
                {loading ? `Loading ${label.toLowerCase()}...` : placeholder}
              </span>
            )
          ) : value ? (
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

        {error && !multiple && (
          <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {multiple && selectedItems.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {items
            .filter((item) => selectedItems.includes(getId(item)))
            .map((item) => (
              <span
                key={getId(item)}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
              >
                {item.Dsg_Desc ||
                  item.Dsg_EName ||
                  `Designation ${getId(item)}`}
                <button
                  type="button"
                  onClick={() => onToggleItem && onToggleItem(getId(item))}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </span>
            ))}
        </div>
      )}

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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
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

          {/* Select All / Clear All buttons for multi-select */}
          {multiple && showSelectAll && items.length > 0 && (
            <div className="p-2 border-b border-gray-200 bg-gray-50 flex gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                className="flex-1 px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors flex items-center justify-center"
              >
                <Check className="h-3 w-3 mr-1" />
                Select All ({items.length})
              </button>
              <button
                type="button"
                onClick={onClearAll}
                className="flex-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Clear All
              </button>
            </div>
          )}

          <div
            ref={listRef}
            className="overflow-y-auto max-h-64"
            onWheel={handleWheel}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const itemId = getId(item);
                const isSelected = multiple && selectedItems.includes(itemId);

                return (
                  <button
                    key={itemId}
                    ref={(el) => {
                      if (el && itemRefs.current) {
                        itemRefs.current[idx] = el;
                      }
                    }}
                    type="button"
                    onClick={() => {
                      if (multiple) {
                        onToggleItem && onToggleItem(itemId);
                      } else {
                        onSelect(item);
                      }
                    }}
                    onKeyDown={(e) => onItemKeyDown(e, item, idx)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-purple-50 ${
                      highlightedIndex == idx
                        ? "bg-purple-100"
                        : isSelected
                          ? "bg-purple-50"
                          : "text-gray-700"
                    }`}
                    tabIndex={0}
                  >
                    {multiple && (
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex-1">
                          {renderItem ? (
                            renderItem(item)
                          ) : (
                            <div className="font-medium">
                              {item.Dsg_Desc ||
                                item.Dsg_EName ||
                                `Designation ${itemId}`}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {!multiple && renderItem ? (
                      renderItem(item)
                    ) : !multiple ? (
                      <div className="font-medium">
                        {item.Dsg_Desc ||
                          item.Dsg_EName ||
                          `Designation ${itemId}`}
                      </div>
                    ) : null}
                    {!multiple && value && itemId == value && (
                      <div className="text-xs text-purple-600 mt-1 flex items-center">
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

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredItems.length} items found</span>
              {multiple && <span>{selectedItems.length} selected</span>}
            </div>
          </div>
        </div>
      )}

      {error && !multiple && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

const AddEditActionMaster = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // Departments with hierarchy
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // All designations from API (will NOT be filtered by department anymore)
  const [allDesignations, setAllDesignations] = useState([]);
  const [flattenedAllDesignations, setFlattenedAllDesignations] = useState([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);

  // Previous Status options based on Stage (partial match)
  const [previousStatusOptions, setPreviousStatusOptions] = useState([]);
  const [loadingPreviousStatus, setLoadingPreviousStatus] = useState(false);
  const [prevStatusApiCalled, setPrevStatusApiCalled] = useState(false);

  // Department dropdown states
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);
  const deptDropdownRef = useRef(null);
  const deptSearchRef = useRef(null);
  const deptButtonRef = useRef(null);
  const deptItemRefs = useRef([]);
  const deptListRef = useRef(null);

  // Designation (Authorities) dropdown states - MULTI-SELECT (NOW SHOWS ALL DESIGNATIONS)
  const [desgSearchTerm, setDesgSearchTerm] = useState("");
  const [isDesgDropdownOpen, setIsDesgDropdownOpen] = useState(false);
  const [desgHighlightedIndex, setDesgHighlightedIndex] = useState(-1);
  const desgDropdownRef = useRef(null);
  const desgSearchRef = useRef(null);
  const desgButtonRef = useRef(null);
  const desgItemRefs = useRef([]);
  const desgListRef = useRef(null);

  // Viewers dropdown states - MULTI-SELECT (NOW SHOWS ALL DESIGNATIONS)
  const [viewersSearchTerm, setViewersSearchTerm] = useState("");
  const [isViewersDropdownOpen, setIsViewersDropdownOpen] = useState(false);
  const [viewersHighlightedIndex, setViewersHighlightedIndex] = useState(-1);
  const viewersDropdownRef = useRef(null);
  const viewersSearchRef = useRef(null);
  const viewersButtonRef = useRef(null);
  const viewersItemRefs = useRef([]);
  const viewersListRef = useRef(null);

  // Previous Status dropdown states - SINGLE SELECT (now using ID)
  const [filteredPreviousStatus, setFilteredPreviousStatus] = useState([]);
  const [prevStatusSearchTerm, setPrevStatusSearchTerm] = useState("");
  const [isPrevStatusDropdownOpen, setIsPrevStatusDropdownOpen] =
    useState(false);
  const [prevStatusHighlightedIndex, setPrevStatusHighlightedIndex] =
    useState(-1);
  const prevStatusDropdownRef = useRef(null);
  const prevStatusSearchRef = useRef(null);
  const prevStatusButtonRef = useRef(null);
  const prevStatusItemRefs = useRef([]);
  const prevStatusListRef = useRef(null);

  // Refs for focus management
  const stageRef = useRef(null);
  const prevStatusRef = useRef(null);
  const statusNameRef = useRef(null);
  const authoritiesButtonRef = useRef(null);
  const viewersButtonRef2 = useRef(null);
  const remarksRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    Dpt_id: "",
    St_Name: "",
    Previous_Status: "", // Now stores the ID (Act_Id)
    stage: "",
    Viewers: [],
    Authorities: [],
    Act_Remarks: "",
    Is_Forward: "N",
    Is_Bank_Select: "N",
    Is_Acc_Vou_No_Gen: "N",
  });

  // =============  BUILD TREE STRUCTURE FUNCTIONS ==============
  const buildDepartmentTree = (depts) => {
    const map = {};
    const roots = [];

    depts.forEach((dept) => {
      map[dept.Dpt_id] = { ...dept, children: [] };
    });

    depts.forEach((dept) => {
      if (dept.UpGrp && map[dept.UpGrp] && dept.UpGrp != dept.Dpt_id) {
        map[dept.UpGrp].children.push(map[dept.Dpt_id]);
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
      map[desg.Dsg_id] = { ...desg, children: [] };
    });

    desgs.forEach((desg) => {
      if (desg.UpGrp && map[desg.UpGrp] && desg.UpGrp != desg.Dsg_id) {
        map[desg.UpGrp].children.push(map[desg.Dsg_id]);
      } else {
        roots.push(map[desg.Dsg_id]);
      }
    });

    return roots;
  };

  const flattenTree = (nodes, level = 1, result = []) => {
    nodes.forEach((node) => {
      result.push({ ...node, treeLevel: level });
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, level + 1, result);
      }
    });
    return result;
  };

  // REMOVED: filterDesignationsByDepartment function - no longer needed

  // Load all designations once
  const loadAllDesignations = async () => {
    setLoadingDesignations(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_BASE_URL}/designation/all`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      let designationsData = [];
      if (response.data && response.data.data) {
        designationsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        designationsData = response.data;
      }

      const validDesignations = designationsData
        .filter((desg) => desg && desg.Dsg_id)
        .sort((a, b) => (a.GrCod || "").localeCompare(b.GrCod || ""));

      setAllDesignations(validDesignations);

      // Build tree structure for all designations
      const tree = buildDesignationTree(validDesignations);
      const flattened = flattenTree(tree);
      setFlattenedAllDesignations(flattened);
    } catch (error) {
      console.error("Error loading designations:", error);
      toast.error("Failed to load designation data");
      setAllDesignations([]);
      setFlattenedAllDesignations([]);
    } finally {
      setLoadingDesignations(false);
    }
  };

  // Load Previous Status options based on Stage (partial match) - Now returns objects with id and name
  const loadPreviousStatusOptions = async (stageValue) => {
    if (!stageValue || stageValue.length < 1) {
      setPreviousStatusOptions([]);
      setPrevStatusApiCalled(false);
      return;
    }

    setLoadingPreviousStatus(true);
    setPrevStatusApiCalled(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${API_BASE_URL}/action-master/all?stage=${stageValue}`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      let actionsData = [];
      if (response.data && response.data.status == true && response.data.data) {
        actionsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        actionsData = response.data;
      } else if (response.data && response.data.data) {
        actionsData = response.data.data;
      }

      // Extract unique actions with their IDs and names for Previous Status options
      const uniqueStatuses = [];
      const statusMap = new Map();

      actionsData.forEach((action) => {
        if (action.Act_Id && action.St_Name && !statusMap.has(action.Act_Id)) {
          statusMap.set(action.Act_Id, true);
          uniqueStatuses.push({
            id: action.Act_Id.toString(),
            name: action.St_Name,
            description: `Status for stage ${action.stage}`,
            stage: action.stage,
            act_id: action.Act_Id,
          });
        }
      });

      // Sort alphabetically by name
      uniqueStatuses.sort((a, b) => a.name.localeCompare(b.name));
      setPreviousStatusOptions(uniqueStatuses);

      // In edit mode, validate if current Previous_Status ID exists in new options
      if (isEditMode && formData.Previous_Status) {
        const isValid = uniqueStatuses.some(
          (s) => s.id == formData.Previous_Status,
        );
        if (!isValid && uniqueStatuses.length > 0) {
          toast.info(
            `Previous Status ID "${formData.Previous_Status}" is not available for stage "${stageValue}"`,
          );
        }
      }
    } catch (error) {
      console.error("Error fetching previous status options:", error);
      toast.error("Failed to load previous status options");
      setPreviousStatusOptions([]);
    } finally {
      setLoadingPreviousStatus(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    loadAllDesignations(); // Load all designations once

    if (id && id != "create") {
      setIsEditMode(true);
      loadActionData();
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(event.target)
      ) {
        setIsDeptDropdownOpen(false);
        setDeptHighlightedIndex(-1);
        setDeptSearchTerm("");
      }
      if (
        desgDropdownRef.current &&
        !desgDropdownRef.current.contains(event.target)
      ) {
        setIsDesgDropdownOpen(false);
        setDesgHighlightedIndex(-1);
        setDesgSearchTerm("");
      }
      if (
        viewersDropdownRef.current &&
        !viewersDropdownRef.current.contains(event.target)
      ) {
        setIsViewersDropdownOpen(false);
        setViewersHighlightedIndex(-1);
        setViewersSearchTerm("");
      }
      if (
        prevStatusDropdownRef.current &&
        !prevStatusDropdownRef.current.contains(event.target)
      ) {
        setIsPrevStatusDropdownOpen(false);
        setPrevStatusHighlightedIndex(-1);
        setPrevStatusSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  // REMOVED: Filter designations by department useEffect - no longer needed
  // Now Authorities and Viewers will use allDesignations directly

  // Load previous status options whenever stage changes (any length)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.stage && formData.stage.length >= 1) {
        loadPreviousStatusOptions(formData.stage);
      } else {
        setPreviousStatusOptions([]);
        setPrevStatusApiCalled(false);
        setFilteredPreviousStatus([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.stage]);

  // Filter designations for Authorities dropdown (now using allDesignations)
  useEffect(() => {
    if (!flattenedAllDesignations.length) {
      return;
    }

    if (!desgSearchTerm.trim()) {
      // Keep the tree structure but filter doesn't change the tree
      return;
    } else {
      const term = desgSearchTerm.toLowerCase();
      const filtered = flattenedAllDesignations.filter(
        (desg) =>
          (desg.Dsg_Desc?.toLowerCase() || "").includes(term) ||
          (desg.Dsg_EName?.toLowerCase() || "").includes(term),
      );
      // We need to update the displayed filtered items
      // This is handled by the dropdown's filteredItems prop
    }
  }, [desgSearchTerm, flattenedAllDesignations]);

  // Filter viewers for Viewers dropdown (now using allDesignations)
  useEffect(() => {
    if (!flattenedAllDesignations.length) {
      return;
    }

    if (!viewersSearchTerm.trim()) {
      // Keep the tree structure
      return;
    } else {
      const term = viewersSearchTerm.toLowerCase();
      const filtered = flattenedAllDesignations.filter(
        (viewer) =>
          (viewer.Dsg_Desc?.toLowerCase() || "").includes(term) ||
          (viewer.Dsg_EName?.toLowerCase() || "").includes(term),
      );
    }
  }, [viewersSearchTerm, flattenedAllDesignations]);

  // Filter previous status options
  useEffect(() => {
    if (!previousStatusOptions.length) {
      setFilteredPreviousStatus([]);
      return;
    }

    if (!prevStatusSearchTerm.trim()) {
      setFilteredPreviousStatus(previousStatusOptions);
    } else {
      const term = prevStatusSearchTerm.toLowerCase();
      const filtered = previousStatusOptions.filter((status) =>
        (status.name?.toLowerCase() || "").includes(term),
      );
      setFilteredPreviousStatus(filtered);
    }
    setPrevStatusHighlightedIndex(-1);
  }, [prevStatusSearchTerm, previousStatusOptions]);

  // Focus on department field after loading
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => deptButtonRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isDeptDropdownOpen && deptSearchRef.current) {
      setTimeout(() => deptSearchRef.current.focus(), 0);
    }
  }, [isDeptDropdownOpen]);

  useEffect(() => {
    if (isDesgDropdownOpen && desgSearchRef.current) {
      setTimeout(() => desgSearchRef.current.focus(), 0);
    }
  }, [isDesgDropdownOpen]);

  useEffect(() => {
    if (isViewersDropdownOpen && viewersSearchRef.current) {
      setTimeout(() => viewersSearchRef.current.focus(), 0);
    }
  }, [isViewersDropdownOpen]);

  useEffect(() => {
    if (isPrevStatusDropdownOpen && prevStatusSearchRef.current) {
      setTimeout(() => prevStatusSearchRef.current.focus(), 0);
    }
  }, [isPrevStatusDropdownOpen]);

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
    if (
      isDesgDropdownOpen &&
      desgHighlightedIndex >= 0 &&
      desgListRef.current
    ) {
      const container = desgListRef.current;
      const item = desgItemRefs.current[desgHighlightedIndex];
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
  }, [desgHighlightedIndex, isDesgDropdownOpen]);

  useEffect(() => {
    if (
      isViewersDropdownOpen &&
      viewersHighlightedIndex >= 0 &&
      viewersListRef.current
    ) {
      const container = viewersListRef.current;
      const item = viewersItemRefs.current[viewersHighlightedIndex];
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
  }, [viewersHighlightedIndex, isViewersDropdownOpen]);

  useEffect(() => {
    if (
      isPrevStatusDropdownOpen &&
      prevStatusHighlightedIndex >= 0 &&
      prevStatusListRef.current
    ) {
      const container = prevStatusListRef.current;
      const item = prevStatusItemRefs.current[prevStatusHighlightedIndex];
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
  }, [prevStatusHighlightedIndex, isPrevStatusDropdownOpen]);

  // Filter departments with hierarchy
  useEffect(() => {
    if (!departments.length) {
      setFilteredDepartments([]);
      return;
    }

    const tree = buildDepartmentTree(departments);
    const flattened = flattenTree(tree);
    setFlattenedDepartments(flattened);

    if (!deptSearchTerm.trim()) {
      setFilteredDepartments(flattened);
    } else {
      const term = deptSearchTerm.toLowerCase();
      const filtered = flattened.filter(
        (dept) =>
          (dept.Dpt_Name?.toLowerCase() || "").includes(term) ||
          (dept.Dpt_Desc?.toLowerCase() || "").includes(term) ||
          (dept.GrCod?.toLowerCase() || "").includes(term),
      );
      setFilteredDepartments(filtered);
    }
    setDeptHighlightedIndex(-1);
  }, [deptSearchTerm, departments]);

  const loadDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${API_BASE_URL}/dpt-master/all/lst-dpt-master`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      let departmentsData = [];
      if (
        response.data &&
        response.data.success == true &&
        response.data.data
      ) {
        departmentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        departmentsData = response.data;
      } else if (response.data && response.data.data) {
        departmentsData = response.data.data;
      }

      const validDepartments = departmentsData.filter(
        (dept) => dept && dept.Dpt_id,
      );

      setDepartments(validDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load department data");
      setDepartments([]);
      setFlattenedDepartments([]);
      setFilteredDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const loadActionData = async () => {
    setLoading(true);
    try {
      const action = await ActionMasterApi.getById(id);

      // Parse Authorities if it's a string
      let authoritiesArray = [];
      if (action.Authorities) {
        try {
          if (typeof action.Authorities == "string") {
            const cleanStr = action.Authorities.replace(/\\"/g, '"');
            const parsed = JSON.parse(cleanStr);
            authoritiesArray = Array.isArray(parsed) ? parsed.map(String) : [];
          } else if (Array.isArray(action.Authorities)) {
            authoritiesArray = action.Authorities.map(String);
          }
        } catch (e) {
          console.error("Error parsing Authorities:", e);
          authoritiesArray = [];
        }
      }

      // Parse Viewers if it's a string
      let viewersArray = [];
      if (action.Viewers) {
        try {
          if (typeof action.Viewers == "string") {
            const cleanStr = action.Viewers.replace(/\\"/g, '"');
            const parsed = JSON.parse(cleanStr);
            viewersArray = Array.isArray(parsed) ? parsed.map(String) : [];
          } else if (Array.isArray(action.Viewers)) {
            viewersArray = action.Viewers.map(String);
          }
        } catch (e) {
          console.error("Error parsing Viewers:", e);
          viewersArray = [];
        }
      }

      // Previous_Status is now an ID (Act_Id)
      // It can be a string or number, convert to string for consistency
      let previousStatusId = "";
      if (action.Previous_Status) {
        previousStatusId = action.Previous_Status.toString();
      }

      setFormData({
        Dpt_id: action.Dpt_id?.toString() || "",
        St_Name: action.St_Name || "",
        Previous_Status: previousStatusId, // Store the ID
        stage: action.stage || "",
        Viewers: viewersArray,
        Authorities: authoritiesArray,
        Act_Remarks: action.Act_Remarks || "",
        Is_Forward: action.Is_Forward || "N",
        Is_Bank_Select: action.Is_Bank_Select || "N",
        Is_Acc_Vou_No_Gen: action.Is_Acc_Vou_No_Gen || "N",
      });

      // If there's a stage, load previous status options and then set the selected value
      if (action.stage) {
        await loadPreviousStatusOptions(action.stage);
      }
    } catch (error) {
      toast.error("Failed to load action data!");
      navigate("/settings/profile-management/action-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name == "stage") {
      const filteredValue = value.slice(0, 5);
      setFormData((prev) => ({
        ...prev,
        [name]: filteredValue,
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

  const handleIsForwardToggle = () => {
    setFormData((prev) => ({ ...prev, Is_Forward: prev.Is_Forward == "Y" ? "N" : "Y" }));
  };

  const handleIsBankSelectToggle = () => {
    setFormData((prev) => ({ ...prev, Is_Bank_Select: prev.Is_Bank_Select == "Y" ? "N" : "Y" }));
  };

  const handleIsAccVouNoGenToggle = () => {
    setFormData((prev) => ({ ...prev, Is_Acc_Vou_No_Gen: prev.Is_Acc_Vou_No_Gen == "Y" ? "N" : "Y" }));
  };

  // Department handlers
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
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      deptButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredDepartments.length > 0 && deptHighlightedIndex >= 0) {
        handleDepartmentSelect(filteredDepartments[deptHighlightedIndex]);
      } else if (filteredDepartments.length > 0) {
        handleDepartmentSelect(filteredDepartments[0]);
      }
    }
  };

  const handleDeptItemKeyDown = (e, item, idx) => {
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
      handleDepartmentSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      deptButtonRef.current?.focus();
    }
  };

  const handleDepartmentSelect = (dept) => {
    const deptId = dept.Dpt_id?.toString();
    setFormData((prev) => ({
      ...prev,
      Dpt_id: deptId,
      // Note: Authorities and Viewers are NOT cleared anymore since they are now independent of department
    }));
    setIsDeptDropdownOpen(false);
    setDeptSearchTerm("");
    setDeptHighlightedIndex(-1);

    if (errors.Dpt_id) {
      setErrors((prev) => ({ ...prev, Dpt_id: "" }));
    }

    setTimeout(() => stageRef.current?.focus(), 100);
  };

  // Designation (Authorities) handlers
  const handleDesignationKeyDown = (e) => {
    // Removed department validation - now always allowed
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsDesgDropdownOpen(true);
      setDesgSearchTerm("");
      setDesgHighlightedIndex(-1);
      setTimeout(() => desgSearchRef.current?.focus(), 0);
    }
  };

  const handleDesgSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (flattenedAllDesignations.length > 0) {
        setDesgHighlightedIndex(0);
        setTimeout(() => {
          if (desgItemRefs.current[0]) {
            desgItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDesgDropdownOpen(false);
      setDesgHighlightedIndex(-1);
      setDesgSearchTerm("");
      authoritiesButtonRef.current?.focus();
    }
  };

  const handleDesgItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < flattenedAllDesignations.length) {
        setDesgHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (desgItemRefs.current[nextIndex]) {
            desgItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setDesgHighlightedIndex(-1);
        setTimeout(() => desgSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setDesgHighlightedIndex(-1);
        setTimeout(() => desgSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setDesgHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (desgItemRefs.current[prevIndex]) {
            desgItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter" || e.key == " ") {
      e.preventDefault();
      handleDesignationToggle(item.Dsg_id);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDesgDropdownOpen(false);
      setDesgHighlightedIndex(-1);
      setDesgSearchTerm("");
      authoritiesButtonRef.current?.focus();
    }
  };

  const handleDesignationToggle = (desgId) => {
    const desgIdStr = desgId.toString();
    const currentAuthorities = [...formData.Authorities];

    let updatedAuthorities;
    if (currentAuthorities.includes(desgIdStr)) {
      updatedAuthorities = currentAuthorities.filter((id) => id != desgIdStr);
    } else {
      updatedAuthorities = [...currentAuthorities, desgIdStr];
    }

    setFormData((prev) => ({
      ...prev,
      Authorities: updatedAuthorities,
    }));

    if (errors.Authorities) {
      setErrors((prev) => ({ ...prev, Authorities: "" }));
    }
  };

  // Select all authorities
  const handleSelectAllAuthorities = () => {
    const allDesignationIds = flattenedAllDesignations.map((desg) =>
      desg.Dsg_id.toString(),
    );
    setFormData((prev) => ({
      ...prev,
      Authorities: allDesignationIds,
    }));
    toast.success(`Selected ${allDesignationIds.length} designations`);
  };

  // Clear all authorities
  const handleClearAllAuthorities = () => {
    setFormData((prev) => ({
      ...prev,
      Authorities: [],
    }));
    toast.success("Cleared all selections");
  };

  // Viewers handlers
  const handleViewersKeyDown = (e) => {
    // Removed department validation - now always allowed
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsViewersDropdownOpen(true);
      setViewersSearchTerm("");
      setViewersHighlightedIndex(-1);
      setTimeout(() => viewersSearchRef.current?.focus(), 0);
    }
  };

  const handleViewersSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (flattenedAllDesignations.length > 0) {
        setViewersHighlightedIndex(0);
        setTimeout(() => {
          if (viewersItemRefs.current[0]) {
            viewersItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsViewersDropdownOpen(false);
      setViewersHighlightedIndex(-1);
      setViewersSearchTerm("");
      viewersButtonRef.current?.focus();
    }
  };

  const handleViewersItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < flattenedAllDesignations.length) {
        setViewersHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (viewersItemRefs.current[nextIndex]) {
            viewersItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setViewersHighlightedIndex(-1);
        setTimeout(() => viewersSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setViewersHighlightedIndex(-1);
        setTimeout(() => viewersSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setViewersHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (viewersItemRefs.current[prevIndex]) {
            viewersItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter" || e.key == " ") {
      e.preventDefault();
      handleViewersToggle(item.Dsg_id);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsViewersDropdownOpen(false);
      setViewersHighlightedIndex(-1);
      setViewersSearchTerm("");
      viewersButtonRef.current?.focus();
    }
  };

  const handleViewersToggle = (viewerId) => {
    const viewerIdStr = viewerId.toString();
    const currentViewers = [...formData.Viewers];

    let updatedViewers;
    if (currentViewers.includes(viewerIdStr)) {
      updatedViewers = currentViewers.filter((id) => id != viewerIdStr);
    } else {
      updatedViewers = [...currentViewers, viewerIdStr];
    }

    setFormData((prev) => ({
      ...prev,
      Viewers: updatedViewers,
    }));

    if (errors.Viewers) {
      setErrors((prev) => ({ ...prev, Viewers: "" }));
    }
  };

  // Select all viewers
  const handleSelectAllViewers = () => {
    const allDesignationIds = flattenedAllDesignations.map((desg) =>
      desg.Dsg_id.toString(),
    );
    setFormData((prev) => ({
      ...prev,
      Viewers: allDesignationIds,
    }));
    toast.success(`Selected ${allDesignationIds.length} designations`);
  };

  // Clear all viewers
  const handleClearAllViewers = () => {
    setFormData((prev) => ({
      ...prev,
      Viewers: [],
    }));
    toast.success("Cleared all selections");
  };

  // Previous Status handlers - Now using ID
  const handlePrevStatusKeyDown = (e) => {
    if (!previousStatusOptions.length) {
      if (formData.stage) {
        toast.info(
          `No previous status options available for stage "${formData.stage}"`,
        );
      } else {
        toast.error("Please enter a stage first");
      }
      return;
    }

    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsPrevStatusDropdownOpen(true);
      setPrevStatusSearchTerm("");
      setPrevStatusHighlightedIndex(-1);
      setTimeout(() => prevStatusSearchRef.current?.focus(), 0);
    }
  };

  const handlePrevStatusSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredPreviousStatus.length > 0) {
        setPrevStatusHighlightedIndex(0);
        setTimeout(() => {
          if (prevStatusItemRefs.current[0]) {
            prevStatusItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsPrevStatusDropdownOpen(false);
      setPrevStatusHighlightedIndex(-1);
      setPrevStatusSearchTerm("");
      prevStatusRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (
        filteredPreviousStatus.length > 0 &&
        prevStatusHighlightedIndex >= 0
      ) {
        handlePrevStatusSelect(
          filteredPreviousStatus[prevStatusHighlightedIndex],
        );
      } else if (filteredPreviousStatus.length > 0) {
        handlePrevStatusSelect(filteredPreviousStatus[0]);
      }
    }
  };

  const handlePrevStatusItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredPreviousStatus.length) {
        setPrevStatusHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (prevStatusItemRefs.current[nextIndex]) {
            prevStatusItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setPrevStatusHighlightedIndex(-1);
        setTimeout(() => prevStatusSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setPrevStatusHighlightedIndex(-1);
        setTimeout(() => prevStatusSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setPrevStatusHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (prevStatusItemRefs.current[prevIndex]) {
            prevStatusItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handlePrevStatusSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsPrevStatusDropdownOpen(false);
      setPrevStatusHighlightedIndex(-1);
      setPrevStatusSearchTerm("");
      prevStatusRef.current?.focus();
    }
  };

  const handlePrevStatusSelect = (status) => {
    // Store the ID (status.id) instead of the name
    setFormData((prev) => ({
      ...prev,
      Previous_Status: status.id,
    }));
    setIsPrevStatusDropdownOpen(false);
    setPrevStatusSearchTerm("");
    setPrevStatusHighlightedIndex(-1);

    if (errors.Previous_Status) {
      setErrors((prev) => ({ ...prev, Previous_Status: "" }));
    }

    setTimeout(() => statusNameRef.current?.focus(), 100);
  };

  // Display functions
  const renderDepartmentItem = (dept) => {
    const level = parseInt(dept.GrStt, 10) || 1;
    const desc = dept.Dpt_Desc || "No Description";
    const name = dept.Dpt_Name;

    const levelColors = {
      1: "bg-blue-100 text-blue-600",
      2: "bg-green-100 text-green-600",
      3: "bg-amber-100 text-amber-600",
      4: "bg-purple-100 text-purple-600",
    };
    const colorClass = levelColors[level] || "bg-gray-100 text-gray-600";

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
              className="text-sm font-medium text-gray-900 whitespace-pre-wrap"
              style={{ marginLeft: `${(level - 1) * 20}px` }}
            >
              {desc}
            </div>
            {name && name != desc && (
              <div
                className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap"
                style={{ marginLeft: `${(level - 1) * 20}px` }}
              >
                {name}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getSelectedDepartmentDisplay = () => {
    if (!formData.Dpt_id) return "";
    const selected = flattenedDepartments.find(
      (dept) => dept.Dpt_id?.toString() == formData.Dpt_id,
    );
    if (!selected) return "Selected department not found";

    const level = parseInt(selected.GrStt, 10) || 1;
    const desc = selected.Dpt_Desc || "No Description";
    const name = selected.Dpt_Name;

    if (name && name != desc) {
      return `${desc} (${name})`;
    }
    return desc;
  };

  const renderDesignationItem = (desg) => {
    const level = parseInt(desg.GrStt, 10) || 1;
    const desc = desg.Dsg_Desc || "No Description";
    const englishName = desg.Dsg_EName;

    const levelColors = {
      1: "bg-blue-100 text-blue-600",
      2: "bg-green-100 text-green-600",
      3: "bg-amber-100 text-amber-600",
      4: "bg-purple-100 text-purple-600",
    };
    const colorClass = levelColors[level] || "bg-gray-100 text-gray-600";

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
              className="text-sm font-medium text-gray-900 whitespace-pre-wrap"
              style={{ marginLeft: `${(level - 1) * 20}px` }}
            >
              {desc}
            </div>
            {englishName && (
              <div
                className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap"
                style={{ marginLeft: `${(level - 1) * 20}px` }}
              >
                {englishName}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPrevStatusItem = (status) => {
    return (
      <div className="py-1">
        <div className="flex items-start">
          <div className="h-6 w-6 rounded bg-amber-100 text-amber-600 flex items-center justify-center mr-3 flex-shrink-0">
            <Hash className="h-3 w-3" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {status.name}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getSelectedPrevStatusDisplay = () => {
    if (!formData.Previous_Status) return "";
    // Find the status by ID to display its name
    const selected = previousStatusOptions.find(
      (status) => status.id == formData.Previous_Status,
    );
    return selected ? selected.name : `${formData.Previous_Status}`;
  };

  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    if (formData.St_Name && formData.St_Name.length > 25) {
      newErrors.St_Name = "Status name must not exceed 25 characters";
    }

    // Previous_Status is now an ID, so we don't validate length the same way
    // But we might want to ensure it's a valid ID if provided
    if (formData.Previous_Status && formData.Previous_Status.length > 10) {
      newErrors.Previous_Status = "Invalid previous status ID";
    }

    if (formData.stage && formData.stage.length > 5) {
      newErrors.stage = "Stage must not exceed 5 characters";
    }

    if (formData.Act_Remarks && formData.Act_Remarks.length > 150) {
      newErrors.Act_Remarks = "Remarks must not exceed 150 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors).find((key) => errors[key]);
      if (firstErrorKey) {
        toast.error(errors[firstErrorKey]);
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Action?" : "Create New Action?",
      text: isEditMode
        ? "Are you sure you want to update this action information?"
        : "Are you sure you want to create this new action?",
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
      const actionData = {
        ...formData,
        St_Name: formData.St_Name.trim() || null,
        Previous_Status: formData.Previous_Status || null, // Send the ID
        stage: formData.stage.trim() || null,
        Viewers: formData.Viewers.length ? formData.Viewers : null,
        Act_Remarks: formData.Act_Remarks.trim() || null,
        Dpt_id: formData.Dpt_id || null,
        Is_Forward: formData.Is_Forward,
        Is_Bank_Select: formData.Is_Bank_Select,
        Is_Acc_Vou_No_Gen: formData.Is_Acc_Vou_No_Gen,
      };

      if (isEditMode) {
        await ActionMasterApi.update(id, actionData);
        toast.success("Action updated successfully!");
      } else {
        await ActionMasterApi.create(actionData);
        toast.success("Action created successfully!");
      }

      setTimeout(() => {
        navigate("/settings/profile-management/action-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving action:", error);
      toast.error(
        error.message ||
          (isEditMode
            ? "Failed to update action. Please try again."
            : "Failed to create action. Please try again."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/settings/profile-management/action-master");
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading action data...</p>
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
              navigate("/settings/profile-management/action-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Action" : "Add New Action"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update action master information"
                : "Create a new action master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Action Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <GitMerge className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Action Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Department Dropdown with Hierarchy */}
            <SearchableDropdown
              label="Department"
              value={formData.Dpt_id}
              error={errors.Dpt_id}
              icon={Building}
              isOpen={isDeptDropdownOpen}
              setIsOpen={setIsDeptDropdownOpen}
              searchTerm={deptSearchTerm}
              setSearchTerm={setDeptSearchTerm}
              items={flattenedDepartments}
              filteredItems={filteredDepartments}
              highlightedIndex={deptHighlightedIndex}
              onSelect={handleDepartmentSelect}
              onKeyDown={handleDepartmentKeyDown}
              onSearchKeyDown={handleDeptSearchKeyDown}
              onItemKeyDown={handleDeptItemKeyDown}
              getSelectedDisplay={getSelectedDepartmentDisplay}
              loading={loadingDepartments}
              placeholder="Select Department"
              searchPlaceholder="Search by department name, description..."
              buttonRef={deptButtonRef}
              dropdownRef={deptDropdownRef}
              searchRef={deptSearchRef}
              itemRefs={deptItemRefs}
              listRef={deptListRef}
              getId={(item) => item.Dpt_id?.toString()}
              renderItem={renderDepartmentItem}
            />

            {/* 2. Stage - Any input, max 5 characters */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Stage{" "}
                  <span className="text-gray-400 text-xs">
                    (Optional - Max 5 characters)
                  </span>
                </label>
                <span
                  className={`text-xs ${
                    formData.stage.length > 0
                      ? "text-gray-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.stage.length}/5 characters
                </span>
              </div>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={stageRef}
                  type="text"
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, prevStatusRef)}
                  className={`w-full pl-10 pr-3 py-2.5 border ${
                    errors.stage ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., L, L1, LVL01"
                  maxLength={5}
                />
              </div>
              {errors.stage ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.stage}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Stage code - Previous Status options will appear as you type
                </p>
              )}
            </div>

            {/* 3. Previous Status - Now using ID */}
            <SearchableDropdown
              label="Previous Status"
              value={formData.Previous_Status}
              error={errors.Previous_Status}
              icon={Hash}
              isOpen={isPrevStatusDropdownOpen}
              setIsOpen={setIsPrevStatusDropdownOpen}
              searchTerm={prevStatusSearchTerm}
              setSearchTerm={setPrevStatusSearchTerm}
              items={previousStatusOptions}
              filteredItems={filteredPreviousStatus}
              highlightedIndex={prevStatusHighlightedIndex}
              onSelect={handlePrevStatusSelect}
              onKeyDown={handlePrevStatusKeyDown}
              onSearchKeyDown={handlePrevStatusSearchKeyDown}
              onItemKeyDown={handlePrevStatusItemKeyDown}
              getSelectedDisplay={getSelectedPrevStatusDisplay}
              loading={loadingPreviousStatus}
              placeholder={
                formData.stage
                  ? previousStatusOptions.length > 0
                    ? "Select Previous Status"
                    : prevStatusApiCalled
                      ? "No options available"
                      : "Loading options..."
                  : "Enter Stage first"
              }
              searchPlaceholder="Search by status name..."
              buttonRef={prevStatusRef}
              dropdownRef={prevStatusDropdownRef}
              searchRef={prevStatusSearchRef}
              itemRefs={prevStatusItemRefs}
              listRef={prevStatusListRef}
              getId={(item) => item.id}
              renderItem={renderPrevStatusItem}
              disabled={!formData.stage || previousStatusOptions.length == 0}
            />

            {/* 4. Status Name - Optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Status Name{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.St_Name.length > 20
                      ? formData.St_Name.length >= 25
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.St_Name.length}/25 characters
                </span>
              </div>
              <div className="relative">
                <GitMerge className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={statusNameRef}
                  type="text"
                  name="St_Name"
                  value={formData.St_Name}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, authoritiesButtonRef)}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.St_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., Tender Created, In Process, Closed"
                  maxLength={25}
                />
                {formData.St_Name && !errors.St_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.St_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.St_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.St_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Descriptive name for the action status (max 25 characters)
                </p>
              )}
            </div>

            {/* 5. Is_Forward - Toggle Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Is Forward <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleIsForwardToggle}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.Is_Forward == "Y"
                    ? "bg-green-50 border-green-500 shadow-sm"
                    : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <Send
                    className={`h-5 w-5 mr-2 ${
                      formData.Is_Forward == "Y"
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      formData.Is_Forward == "Y"
                        ? "text-green-700"
                        : "text-gray-600"
                    }`}
                  >
                    {formData.Is_Forward == "Y"
                      ? "Forward Allowed"
                      : "Forward Not Allowed"}
                  </span>
                </div>
                <div className="flex items-center">
                  {formData.Is_Forward == "Y" ? (
                    <ToggleRight className="h-7 w-7 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-gray-400" />
                  )}
                </div>
              </button>
              <p className="mt-1 text-xs text-gray-500">
                {formData.Is_Forward == "Y"
                  ? "This action can be forwarded to next stage"
                  : "This action cannot be forwarded"}
              </p>
            </div>

            {/* 6. Authorities - Multi-select showing ALL designations with Select All option */}
            <SearchableDropdown
              label="Authorities"
              value=""
              error={errors.Authorities}
              icon={Users}
              isOpen={isDesgDropdownOpen}
              setIsOpen={setIsDesgDropdownOpen}
              searchTerm={desgSearchTerm}
              setSearchTerm={setDesgSearchTerm}
              items={flattenedAllDesignations}
              filteredItems={flattenedAllDesignations.filter(
                (item) =>
                  !desgSearchTerm.trim() ||
                  (item.Dsg_Desc?.toLowerCase() || "").includes(
                    desgSearchTerm.toLowerCase(),
                  ) ||
                  (item.Dsg_EName?.toLowerCase() || "").includes(
                    desgSearchTerm.toLowerCase(),
                  ),
              )}
              highlightedIndex={desgHighlightedIndex}
              onSelect={() => {}}
              onKeyDown={handleDesignationKeyDown}
              onSearchKeyDown={handleDesgSearchKeyDown}
              onItemKeyDown={handleDesgItemKeyDown}
              getSelectedDisplay={() =>
                `${formData.Authorities.length} selected`
              }
              loading={loadingDesignations}
              placeholder="Select Authorities (All Designations)"
              searchPlaceholder="Search by designation name, description..."
              buttonRef={authoritiesButtonRef}
              dropdownRef={desgDropdownRef}
              searchRef={desgSearchRef}
              itemRefs={desgItemRefs}
              listRef={desgListRef}
              getId={(item) => item.Dsg_id?.toString()}
              renderItem={renderDesignationItem}
              disabled={false}
              multiple={true}
              selectedItems={formData.Authorities}
              onToggleItem={handleDesignationToggle}
              onSelectAll={handleSelectAllAuthorities}
              onClearAll={handleClearAllAuthorities}
              showSelectAll={true}
            />

            {/* 7. Viewers - Multi-select showing ALL designations (no Select All option) */}
            <SearchableDropdown
              label="Viewers"
              value=""
              error={errors.Viewers}
              icon={UserCheck}
              isOpen={isViewersDropdownOpen}
              setIsOpen={setIsViewersDropdownOpen}
              searchTerm={viewersSearchTerm}
              setSearchTerm={setViewersSearchTerm}
              items={flattenedAllDesignations}
              filteredItems={flattenedAllDesignations.filter(
                (item) =>
                  !viewersSearchTerm.trim() ||
                  (item.Dsg_Desc?.toLowerCase() || "").includes(
                    viewersSearchTerm.toLowerCase(),
                  ) ||
                  (item.Dsg_EName?.toLowerCase() || "").includes(
                    viewersSearchTerm.toLowerCase(),
                  ),
              )}
              highlightedIndex={viewersHighlightedIndex}
              onSelect={() => {}}
              onKeyDown={handleViewersKeyDown}
              onSearchKeyDown={handleViewersSearchKeyDown}
              onItemKeyDown={handleViewersItemKeyDown}
              getSelectedDisplay={() => `${formData.Viewers.length} selected`}
              loading={loadingDesignations}
              placeholder="Select Viewers (All Designations)"
              searchPlaceholder="Search by designation name, description..."
              buttonRef={viewersButtonRef}
              dropdownRef={viewersDropdownRef}
              searchRef={viewersSearchRef}
              itemRefs={viewersItemRefs}
              listRef={viewersListRef}
              getId={(item) => item.Dsg_id?.toString()}
              renderItem={renderDesignationItem}
              disabled={false}
              multiple={true}
              selectedItems={formData.Viewers}
              onToggleItem={handleViewersToggle}
              onSelectAll={handleSelectAllViewers}
              onClearAll={handleClearAllViewers}
              showSelectAll={true}
            />

            {/* 7a. Is_Bank_Select Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Select <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleIsBankSelectToggle}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.Is_Bank_Select == "Y"
                    ? "bg-green-50 border-green-500 shadow-sm"
                    : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <Send
                    className={`h-5 w-5 mr-2 ${
                      formData.Is_Bank_Select == "Y" ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      formData.Is_Bank_Select == "Y" ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    {formData.Is_Bank_Select == "Y" ? "Bank Select Enabled" : "Bank Select Disabled"}
                  </span>
                </div>
                <div className="flex items-center">
                  {formData.Is_Bank_Select == "Y" ? (
                    <ToggleRight className="h-7 w-7 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-gray-400" />
                  )}
                </div>
              </button>
            </div>

            {/* 7b. Is_Acc_Vou_No_Gen Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Voucher Number Generate <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleIsAccVouNoGenToggle}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.Is_Acc_Vou_No_Gen == "Y"
                    ? "bg-green-50 border-green-500 shadow-sm"
                    : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <Send
                    className={`h-5 w-5 mr-2 ${
                      formData.Is_Acc_Vou_No_Gen == "Y" ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      formData.Is_Acc_Vou_No_Gen == "Y" ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    {formData.Is_Acc_Vou_No_Gen == "Y" ? "Acc Vou No Gen Enabled" : "Acc Vou No Gen Disabled"}
                  </span>
                </div>
                <div className="flex items-center">
                  {formData.Is_Acc_Vou_No_Gen == "Y" ? (
                    <ToggleRight className="h-7 w-7 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-gray-400" />
                  )}
                </div>
              </button>
            </div>

            {/* 8. Remarks */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Remarks{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.Act_Remarks.length > 100
                      ? formData.Act_Remarks.length >= 150
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.Act_Remarks.length}/150 characters
                </span>
              </div>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  ref={remarksRef}
                  name="Act_Remarks"
                  value={formData.Act_Remarks}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                  rows="3"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter remarks or description for this action..."
                  maxLength={150}
                />
              </div>
              {errors.Act_Remarks ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Act_Remarks}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Additional details about this action (max 150 characters)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-end pt-6 border-t">
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
                  {isEditMode ? "Update Action" : "Add Action"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditActionMaster;