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
  Award,
  Hash,
  Building,
  CheckCircle,
  XCircle,
  Check,
  AlertCircle,
  Calendar,
  DollarSign,
  FileCheck,
  TrendingUp,
  FolderTree,
  ChevronDown,
  Search,
  Loader,
  XCircle as XCircleIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { GrantTypeMasterApi } from "../../../services/granttypemasterapi";

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
  disabled = false,
  renderItem,
}) => {
  const handleWheel = (e) => {
    e.stopPropagation();
  };

  const handleSearchChange = (e) => {
    if (typeof setSearchTerm == "function") {
      setSearchTerm(e.target.value);
    }
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
                onChange={handleSearchChange}
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
                  <XCircleIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div
            ref={listRef}
            className="overflow-y-auto max-h-64"
            onWheel={handleWheel}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => (
                <button
                  key={item.GC_Id || item.GA_Id || item.id || idx}
                  ref={(el) => {
                    if (el && itemRefs.current) {
                      itemRefs.current[idx] = el;
                    }
                  }}
                  type="button"
                  onClick={() => onSelect(item)}
                  onKeyDown={(e) => onItemKeyDown(e, item, idx)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                    highlightedIndex == idx
                      ? "bg-blue-100"
                      : value &&
                          item &&
                          (item.GC_Id || item.GA_Id) &&
                          value == (item.GC_Id || item.GA_Id).toString()
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700"
                  }`}
                  tabIndex={0}
                >
                  {renderItem ? renderItem(item) : item.name}
                  {value &&
                    item &&
                    (item.GC_Id || item.GA_Id) &&
                    value == (item.GC_Id || item.GA_Id).toString() && (
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
                <p>No items found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredItems.length} items found</span>
            </div>
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

const AddEditGrantType = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAuthorities, setLoadingAuthorities] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [grantAuthorities, setGrantAuthorities] = useState([]);
  const [grantCategories, setGrantCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredAuthorities, setFilteredAuthorities] = useState([]);
  const [errors, setErrors] = useState({});

  // Grant Category dropdown states
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categoryHighlightedIndex, setCategoryHighlightedIndex] = useState(-1);
  const categoryDropdownRef = useRef(null);
  const categorySearchRef = useRef(null);
  const categoryItemRefs = useRef([]);
  const categoryListRef = useRef(null);
  const categoryButtonRef = useRef(null);

  // Grant Fund Source dropdown states
  const [authoritySearchTerm, setAuthoritySearchTerm] = useState("");
  const [isAuthorityDropdownOpen, setIsAuthorityDropdownOpen] = useState(false);
  const [authorityHighlightedIndex, setAuthorityHighlightedIndex] =
    useState(-1);
  const authorityDropdownRef = useRef(null);
  const authoritySearchRef = useRef(null);
  const authorityItemRefs = useRef([]);
  const authorityListRef = useRef(null);
  const authorityButtonRef = useRef(null);

  // Refs for focus management - Sequential order
  const grantNameRef = useRef(null);
  const grantCodeRef = useRef(null);
  const categoryButtonRefMain = useRef(null);
  const natureRef = useRef(null);
  const conditionRef = useRef(null);
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const accountingModeRef = useRef(null);
  const authorityButtonRefMain = useRef(null);
  const activeToggleRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    GT_Code: "",
    GT_Name: "",
    GT_Ct_Id: "",
    GT_Nature: "",
    GT_Condition: "",
    GT_Utl_From_Date: "",
    GT_Utl_To_Date: "",
    GT_Act_Mode: "",
    GT_Au_Id: "",
    Is_Active: true,
  });

  useEffect(() => {
    loadGrantAuthorities();
    loadGrantCategories();

    if (id && id != "create") {
      setIsEditMode(true);
      loadGrantTypeData();
    }
  }, [id]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
        setCategorySearchTerm("");
        setCategoryHighlightedIndex(-1);
      }
      if (
        authorityDropdownRef.current &&
        !authorityDropdownRef.current.contains(event.target)
      ) {
        setIsAuthorityDropdownOpen(false);
        setAuthoritySearchTerm("");
        setAuthorityHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus on grant name field after loading
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => grantNameRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isCategoryDropdownOpen && categorySearchRef.current) {
      setTimeout(() => categorySearchRef.current.focus(), 0);
    }
  }, [isCategoryDropdownOpen]);

  useEffect(() => {
    if (isAuthorityDropdownOpen && authoritySearchRef.current) {
      setTimeout(() => authoritySearchRef.current.focus(), 0);
    }
  }, [isAuthorityDropdownOpen]);

  // Scroll highlighted item into view
  const scrollIntoView = (container, item, highlightedIndex, isOpen) => {
    if (isOpen && highlightedIndex >= 0 && container) {
      const containerEl = container.current;
      const itemEl = item.current[highlightedIndex];
      if (itemEl) {
        const containerRect = containerEl.getBoundingClientRect();
        const itemRect = itemEl.getBoundingClientRect();

        if (itemRect.bottom > containerRect.bottom) {
          itemEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          itemEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  };

  useEffect(() => {
    scrollIntoView(
      categoryListRef,
      categoryItemRefs,
      categoryHighlightedIndex,
      isCategoryDropdownOpen,
    );
  }, [categoryHighlightedIndex, isCategoryDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      authorityListRef,
      authorityItemRefs,
      authorityHighlightedIndex,
      isAuthorityDropdownOpen,
    );
  }, [authorityHighlightedIndex, isAuthorityDropdownOpen]);

  // Filter categories based on search
  useEffect(() => {
    if (!categorySearchTerm.trim()) {
      setFilteredCategories(grantCategories);
    } else {
      const term = categorySearchTerm.toLowerCase();
      const filtered = grantCategories.filter(
        (category) =>
          category.GC_Name?.toLowerCase().includes(term) ||
          category.GC_Code?.toLowerCase().includes(term),
      );
      setFilteredCategories(filtered);
    }
    setCategoryHighlightedIndex(-1);
  }, [categorySearchTerm, grantCategories]);

  // Filter authorities based on search
  useEffect(() => {
    if (!authoritySearchTerm.trim()) {
      setFilteredAuthorities(grantAuthorities);
    } else {
      const term = authoritySearchTerm.toLowerCase();
      const filtered = grantAuthorities.filter(
        (authority) =>
          authority.GA_Name?.toLowerCase().includes(term) ||
          authority.GA_Code?.toLowerCase().includes(term),
      );
      setFilteredAuthorities(filtered);
    }
    setAuthorityHighlightedIndex(-1);
  }, [authoritySearchTerm, grantAuthorities]);

  const loadGrantAuthorities = async () => {
    setLoadingAuthorities(true);
    try {
      const authorities = await GrantTypeMasterApi.getGrantAuthorities();
      const activeAuthorities = authorities.filter((auth) => auth.Is_Active);
      setGrantAuthorities(activeAuthorities || []);
      setFilteredAuthorities(activeAuthorities || []);
    } catch (error) {
      console.error("Error loading grant authorities:", error);
      toast.error("Failed to load grant authorities");
    } finally {
      setLoadingAuthorities(false);
    }
  };

  const loadGrantCategories = async () => {
    setLoadingCategories(true);
    try {
      const categories = await GrantTypeMasterApi.getGrantCategories();
      setGrantCategories(categories || []);
      setFilteredCategories(categories || []);
    } catch (error) {
      console.error("Error loading grant categories:", error);
      toast.error("Failed to load grant categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadGrantTypeData = async () => {
    setLoading(true);
    try {
      const grantType = await GrantTypeMasterApi.getById(id);

      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      setFormData({
        GT_Code: grantType.GT_Code || "",
        GT_Name: grantType.GT_Name || "",
        GT_Ct_Id: grantType.GT_Ct_Id ? grantType.GT_Ct_Id.toString() : "",
        GT_Nature: grantType.GT_Nature || "",
        GT_Condition: grantType.GT_Condition || "",
        GT_Utl_From_Date: formatDateForInput(grantType.GT_Utl_From_Date),
        GT_Utl_To_Date: formatDateForInput(grantType.GT_Utl_To_Date),
        GT_Act_Mode: grantType.GT_Act_Mode || "",
        GT_Au_Id: grantType.GT_Au_Id ? grantType.GT_Au_Id.toString() : "",
        Is_Active:
          grantType.Is_Active != undefined ? grantType.Is_Active : true,
      });

      setTimeout(() => grantNameRef.current?.focus(), 100);
    } catch (error) {
      toast.error("Failed to load grant type data!");
      navigate("/masters/grant-management/grant-type-master");
    } finally {
      setLoading(false);
    }
  };

  // General keyboard navigation for Enter key - Sequential flow
  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // Category keyboard handlers
  const handleCategoryKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsCategoryDropdownOpen(true);
      setCategorySearchTerm("");
      setCategoryHighlightedIndex(-1);
      setTimeout(() => categorySearchRef.current?.focus(), 0);
    }
  };

  const handleCategorySearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredCategories.length > 0) {
        setCategoryHighlightedIndex(0);
        setTimeout(() => {
          if (categoryItemRefs.current[0]) {
            categoryItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsCategoryDropdownOpen(false);
      setCategoryHighlightedIndex(-1);
      setCategorySearchTerm("");
      categoryButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredCategories.length > 0 && categoryHighlightedIndex >= 0) {
        handleCategorySelect(filteredCategories[categoryHighlightedIndex]);
      } else if (filteredCategories.length > 0) {
        handleCategorySelect(filteredCategories[0]);
      }
    }
  };

  const handleCategoryItemKeyDown = (e, category, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredCategories.length) {
        setCategoryHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (categoryItemRefs.current[nextIndex]) {
            categoryItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setCategoryHighlightedIndex(-1);
        setTimeout(() => categorySearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setCategoryHighlightedIndex(-1);
        setTimeout(() => categorySearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setCategoryHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (categoryItemRefs.current[prevIndex]) {
            categoryItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleCategorySelect(category);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsCategoryDropdownOpen(false);
      setCategoryHighlightedIndex(-1);
      setCategorySearchTerm("");
      categoryButtonRef.current?.focus();
    }
  };

  const handleCategorySelect = (category) => {
    setFormData((prev) => ({
      ...prev,
      GT_Ct_Id: category.GC_Id.toString(),
    }));
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm("");
    setCategoryHighlightedIndex(-1);

    if (errors.GT_Ct_Id) {
      setErrors((prev) => ({ ...prev, GT_Ct_Id: "" }));
    }

    // Focus on nature after category selection
    setTimeout(() => natureRef.current?.focus(), 100);
  };

  const getSelectedCategoryDisplay = () => {
    if (!formData.GT_Ct_Id) return "";
    const selected = grantCategories.find(
      (cat) => cat.GC_Id == parseInt(formData.GT_Ct_Id),
    );
    if (!selected) return "Selected category not found";
    return (
      selected.GC_Name + (selected.GC_Code ? ` (${selected.GC_Code})` : "")
    );
  };

  const renderCategoryItem = (category) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{category.GC_Name}</div>
    </div>
  );

  // Authority keyboard handlers
  const handleAuthorityKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsAuthorityDropdownOpen(true);
      setAuthoritySearchTerm("");
      setAuthorityHighlightedIndex(-1);
      setTimeout(() => authoritySearchRef.current?.focus(), 0);
    }
  };

  const handleAuthoritySearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredAuthorities.length > 0) {
        setAuthorityHighlightedIndex(0);
        setTimeout(() => {
          if (authorityItemRefs.current[0]) {
            authorityItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsAuthorityDropdownOpen(false);
      setAuthorityHighlightedIndex(-1);
      setAuthoritySearchTerm("");
      authorityButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredAuthorities.length > 0 && authorityHighlightedIndex >= 0) {
        handleAuthoritySelect(filteredAuthorities[authorityHighlightedIndex]);
      } else if (filteredAuthorities.length > 0) {
        handleAuthoritySelect(filteredAuthorities[0]);
      }
    }
  };

  const handleAuthorityItemKeyDown = (e, authority, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredAuthorities.length) {
        setAuthorityHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (authorityItemRefs.current[nextIndex]) {
            authorityItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setAuthorityHighlightedIndex(-1);
        setTimeout(() => authoritySearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setAuthorityHighlightedIndex(-1);
        setTimeout(() => authoritySearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setAuthorityHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (authorityItemRefs.current[prevIndex]) {
            authorityItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleAuthoritySelect(authority);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsAuthorityDropdownOpen(false);
      setAuthorityHighlightedIndex(-1);
      setAuthoritySearchTerm("");
      authorityButtonRef.current?.focus();
    }
  };

  const handleAuthoritySelect = (authority) => {
    setFormData((prev) => ({
      ...prev,
      GT_Au_Id: authority.GA_Id.toString(),
    }));
    setIsAuthorityDropdownOpen(false);
    setAuthoritySearchTerm("");
    setAuthorityHighlightedIndex(-1);

    if (errors.GT_Au_Id) {
      setErrors((prev) => ({ ...prev, GT_Au_Id: "" }));
    }

    // Focus on active toggle after authority selection
    setTimeout(() => activeToggleRef.current?.focus(), 100);
  };

  const getSelectedAuthorityDisplay = () => {
    if (!formData.GT_Au_Id) return "";
    const selected = grantAuthorities.find(
      (auth) => auth.GA_Id == parseInt(formData.GT_Au_Id),
    );
    if (!selected) return "Selected grant fund source not found";
    return (
      selected.GA_Name + (selected.GA_Code ? ` (${selected.GA_Code})` : "")
    );
  };

  const renderAuthorityItem = (authority) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{authority.GA_Name}</div>
    </div>
  );

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;

    if (name == "GT_Code") {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type == "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const generateCodeSuggestions = () => {
    const name = formData.GT_Name.trim();
    if (!name) return [];

    const suggestions = [];

    const words = name.split(" ").filter((word) => word.length > 0);
    if (words.length == 1) {
      const word = words[0];
      if (word.length >= 2) {
        suggestions.push(word.substring(0, 2).toUpperCase());
      }
      if (word.length >= 3) {
        suggestions.push(word.substring(0, 3).toUpperCase());
      }
      suggestions.push(word.substring(0, 2).toUpperCase() + "001");
      suggestions.push(word.substring(0, 3).toUpperCase() + "001");
    } else if (words.length >= 2) {
      const firstLetters = words
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase();
      suggestions.push(firstLetters);

      if (words[0].length >= 2) {
        suggestions.push(
          (words[0].substring(0, 2) + words[1].charAt(0)).toUpperCase(),
        );
      }
      suggestions.push(firstLetters + "001");
    }

    return Array.from(new Set(suggestions));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.GT_Code && formData.GT_Code.length > 25) {
      newErrors.GT_Code = "Grant code must not exceed 25 characters";
    }

    if (!formData.GT_Name.trim()) {
      newErrors.GT_Name = "Grant name is required";
    } else if (formData.GT_Name.length > 100) {
      newErrors.GT_Name = "Grant name must not exceed 100 characters";
    }

    if (formData.GT_Nature && !["R", "C"].includes(formData.GT_Nature)) {
      newErrors.GT_Nature =
        "Grant nature must be either 'R' (Revenue) or 'C' (Capital)";
    }

    if (formData.GT_Condition && !["Y", "N"].includes(formData.GT_Condition)) {
      newErrors.GT_Condition = "Grant condition must be either 'Y' or 'N'";
    }

    if (formData.GT_Utl_From_Date && formData.GT_Utl_To_Date) {
      const fromDate = new Date(formData.GT_Utl_From_Date);
      const toDate = new Date(formData.GT_Utl_To_Date);

      if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
        if (fromDate > toDate) {
          newErrors.GT_Utl_From_Date =
            "From date must be before or equal to to date";
          newErrors.GT_Utl_To_Date =
            "To date must be after or equal to from date";
        }
      }
    }

    if (
      formData.GT_Act_Mode &&
      !["Income", "Liability", "Differed"].includes(formData.GT_Act_Mode)
    ) {
      newErrors.GT_Act_Mode =
        "Accounting mode must be either 'Income', 'Liability', or 'Differed'";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
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
      title: isEditMode ? "Update Grant Type?" : "Create New Grant Type?",
      text: isEditMode
        ? "Are you sure you want to update this grant type information?"
        : "Are you sure you want to create this new grant type?",
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
      const grantTypeData = {
        GT_Code: formData.GT_Code.trim() || null,
        GT_Name: formData.GT_Name.trim(),
        GT_Ct_Id: formData.GT_Ct_Id ? parseInt(formData.GT_Ct_Id) : null,
        GT_Nature: formData.GT_Nature || null,
        GT_Condition: formData.GT_Condition || null,
        GT_Utl_From_Date: formData.GT_Utl_From_Date || null,
        GT_Utl_To_Date: formData.GT_Utl_To_Date || null,
        GT_Act_Mode: formData.GT_Act_Mode || null,
        GT_Au_Id: formData.GT_Au_Id ? parseInt(formData.GT_Au_Id) : null,
        Is_Active: formData.Is_Active,
      };

      let response;
      if (isEditMode) {
        response = await GrantTypeMasterApi.update(id, grantTypeData);
        toast.success("Grant type updated successfully!");
      } else {
        response = await GrantTypeMasterApi.create(grantTypeData);
        toast.success("Grant type created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/grant-management/grant-type-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving grant type:", error);

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
              ? "Failed to update grant type. Please try again."
              : "Failed to create grant type. Please try again."),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/grant-management/grant-type-master");
  };

  const suggestions = generateCodeSuggestions();

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading grant type data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/grant-management/grant-type-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Grant Type" : "Add New Grant Type"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update grant type master information"
                : "Create a new grant type master record"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <Award className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Grant Type Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* 1. Grant Name - Required - First field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Grant Name <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    formData.GT_Name.length > 80
                      ? formData.GT_Name.length >= 100
                        ? "text-red-600 font-bold"
                        : "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {formData.GT_Name.length}/100 characters
                </span>
              </div>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={grantNameRef}
                  type="text"
                  name="GT_Name"
                  value={formData.GT_Name}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, grantCodeRef)}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.GT_Name ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="e.g., Capital Grant, Revenue Grant"
                  required
                  maxLength={100}
                />
                {formData.GT_Name && !errors.GT_Name && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.GT_Name && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.GT_Name ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.GT_Name}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Full name of the grant type (required, max 100 characters)
                </p>
              )}
            </div>

            {/* 2. Grant Code - Optional - Second field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Grant Code{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      formData.GT_Code.length > 20
                        ? formData.GT_Code.length >= 25
                          ? "text-red-600 font-bold"
                          : "text-amber-600"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.GT_Code.length}/25 characters
                  </span>
                  {suggestions.length > 0 && !isEditMode && (
                    <div className="text-xs text-gray-500">
                      Suggestions:{" "}
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              GT_Code: suggestion,
                            }));
                          }}
                          className="ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={grantCodeRef}
                  type="text"
                  name="GT_Code"
                  value={formData.GT_Code}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, categoryButtonRefMain)}
                  className={`w-full pl-10 pr-10 py-2.5 border ${
                    errors.GT_Code ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
                  placeholder="e.g., CAP001, REV001 (optional)"
                  maxLength={25}
                />
                {formData.GT_Code && !errors.GT_Code && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.GT_Code && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.GT_Code ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.GT_Code}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Unique code for the grant type (optional, max 25 characters,
                  uppercase only)
                </p>
              )}
            </div>

            {/* 3. Grant Category - Optional Dropdown - Third field */}
            <SearchableDropdown
              label="Grant Category"
              value={formData.GT_Ct_Id}
              error={errors.GT_Ct_Id}
              required={false}
              icon={FolderTree}
              isOpen={isCategoryDropdownOpen}
              setIsOpen={setIsCategoryDropdownOpen}
              searchTerm={categorySearchTerm}
              setSearchTerm={setCategorySearchTerm}
              items={grantCategories}
              filteredItems={filteredCategories}
              highlightedIndex={categoryHighlightedIndex}
              onSelect={handleCategorySelect}
              onKeyDown={handleCategoryKeyDown}
              onSearchKeyDown={handleCategorySearchKeyDown}
              onItemKeyDown={handleCategoryItemKeyDown}
              getSelectedDisplay={getSelectedCategoryDisplay}
              loading={loadingCategories}
              placeholder="Select grant category (Optional)"
              searchPlaceholder="Search by name or code..."
              buttonRef={categoryButtonRef}
              dropdownRef={categoryDropdownRef}
              searchRef={categorySearchRef}
              itemRefs={categoryItemRefs}
              listRef={categoryListRef}
              renderItem={renderCategoryItem}
            />

            {/* 4. Grant Nature - Optional Dropdown - Fourth field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grant Nature{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  ref={natureRef}
                  name="GT_Nature"
                  value={formData.GT_Nature}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, conditionRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.GT_Nature ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                >
                  <option value="">Select nature (Optional)</option>
                  <option value="R">Revenue</option>
                  <option value="C">Capital</option>
                </select>
                {errors.GT_Nature && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500 z-20" />
                )}
              </div>
              {errors.GT_Nature ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.GT_Nature}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Nature of the grant (optional, R for Revenue, C for Capital)
                </p>
              )}
            </div>

            {/* 5. Grant Condition - Optional Dropdown - Fifth field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grant Condition{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <FileCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  ref={conditionRef}
                  name="GT_Condition"
                  value={formData.GT_Condition}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, fromDateRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.GT_Condition ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                >
                  <option value="">Select condition (Optional)</option>
                  <option value="Y">Conditional (Y)</option>
                  <option value="N">Unconditional (N)</option>
                </select>
                {errors.GT_Condition && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500 z-20" />
                )}
              </div>
              {errors.GT_Condition ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.GT_Condition}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Whether the grant has conditions (optional, Y for Yes, N for
                  No)
                </p>
              )}
            </div>

            {/* 6. & 7. Date Range - Sixth & Seventh fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilization From Date{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <input
                    ref={fromDateRef}
                    type="date"
                    name="GT_Utl_From_Date"
                    value={formData.GT_Utl_From_Date}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, toDateRef)}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.GT_Utl_From_Date
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                  />
                </div>
                {errors.GT_Utl_From_Date && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.GT_Utl_From_Date}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilization To Date{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <input
                    ref={toDateRef}
                    type="date"
                    name="GT_Utl_To_Date"
                    value={formData.GT_Utl_To_Date}
                    onChange={handleInputChange}
                    onKeyDown={(e) => handleEnterKey(e, accountingModeRef)}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.GT_Utl_To_Date
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                  />
                </div>
                {errors.GT_Utl_To_Date && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.GT_Utl_To_Date}
                  </p>
                )}
              </div>
            </div>

            {/* 8. Accounting Mode - Optional Dropdown - Eighth field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accounting Mode{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <select
                  ref={accountingModeRef}
                  name="GT_Act_Mode"
                  value={formData.GT_Act_Mode}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, authorityButtonRefMain)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.GT_Act_Mode ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                >
                  <option value="">Select accounting mode (Optional)</option>
                  <option value="Income">Income</option>
                  <option value="Liability">Liability</option>
                  <option value="Differed">Differed</option>
                </select>
                {errors.GT_Act_Mode && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500 z-20" />
                )}
              </div>
              {errors.GT_Act_Mode ? (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.GT_Act_Mode}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Accounting treatment for the grant (optional)
                </p>
              )}
            </div>

            <SearchableDropdown
              label="Grant Fund Source"
              value={formData.GT_Au_Id}
              error={errors.GT_Au_Id}
              required={false}
              icon={Building}
              isOpen={isAuthorityDropdownOpen}
              setIsOpen={setIsAuthorityDropdownOpen}
              searchTerm={authoritySearchTerm}
              setSearchTerm={setAuthoritySearchTerm}
              items={grantAuthorities}
              filteredItems={filteredAuthorities}
              highlightedIndex={authorityHighlightedIndex}
              onSelect={handleAuthoritySelect}
              onKeyDown={handleAuthorityKeyDown}
              onSearchKeyDown={handleAuthoritySearchKeyDown}
              onItemKeyDown={handleAuthorityItemKeyDown}
              getSelectedDisplay={getSelectedAuthorityDisplay}
              loading={loadingAuthorities}
              placeholder="Select Grant Fund Source (Optional)"
              searchPlaceholder="Search by name or code..."
              buttonRef={authorityButtonRef}
              dropdownRef={authorityDropdownRef}
              searchRef={authoritySearchRef}
              itemRefs={authorityItemRefs}
              listRef={authorityListRef}
              renderItem={renderAuthorityItem}
            />

            {/* 11. Active Status Toggle - Eleventh field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="flex items-center">
                  <label className="flex cursor-pointer">
                    <div className="relative">
                      <input
                        ref={activeToggleRef}
                        type="checkbox"
                        name="Is_Active"
                        checked={formData.Is_Active}
                        onChange={handleInputChange}
                        onKeyDown={(e) => handleEnterKey(e, cancelButtonRef)}
                        className="sr-only"
                      />
                      <div
                        className={`block w-14 h-8 rounded-full ${
                          formData.Is_Active ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          formData.Is_Active ? "transform translate-x-6" : ""
                        }`}
                      ></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">
                      {formData.Is_Active ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Enable or disable this grant type
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Grant code cannot be changed after creation
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              ref={saveButtonRef}
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Grant Type" : "Create Grant Type"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditGrantType;
