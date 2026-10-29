// components/masters/employee-records/employee-master/addedit.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ArrowLeft,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Building,
  Hash,
  Globe,
  Search,
  ChevronDown,
  Check,
  BookOpen,
  Loader,
  Briefcase,
  Layers,
  PieChart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import EmployeeMasterApi from "../../../services/employeemasterapi";

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
  totalCount,
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
          } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-left ${
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

          <div
            ref={listRef}
            className="overflow-y-auto max-h-64"
            onWheel={handleWheel}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => (
                <button
                  key={
                    item.value ||
                    item.Dpt_id ||
                    item.ECt_Id ||
                    item.Qut_Id ||
                    item.ETy_Id ||
                    item.Usr_Id ||
                    item.ELg_Id ||
                    idx
                  }
                  ref={(el) => {
                    if (el && itemRefs.current) {
                      itemRefs.current[idx] = el;
                    }
                  }}
                  type="button"
                  onClick={() => onSelect(item)}
                  onKeyDown={(e) => onItemKeyDown(e, item, idx)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-purple-50 ${
                    highlightedIndex == idx
                      ? "bg-purple-100"
                      : value && item.value && value == item.value.toString()
                      ? "bg-purple-50"
                      : ""
                  }`}
                  tabIndex={0}
                >
                  {renderItem ? (
                    renderItem(item)
                  ) : (
                    <div className="font-medium text-gray-900">
                      {item.label}
                    </div>
                  )}
                  {value && item.value && value == item.value.toString() && (
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
                <p>No items found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredItems.length} items found</span>
              {totalCount && <span>Total: {totalCount}</span>}
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

// =============  MULTI-SELECT DROPDOWN COMPONENT FOR DEPARTMENTS ==============
const MultiSelectDropdown = ({
  label,
  selectedValues,
  onChange,
  items,
  displayKey,
  valueKey,
  loading,
  placeholder,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredItems = items.filter((item) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      (item[displayKey]?.toLowerCase() || "").includes(searchValue) ||
      (item.Dpt_Desc?.toLowerCase() || "").includes(searchValue)
    );
  });

  const handleToggle = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !=  value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const getSelectedItems = () => {
    return items.filter((item) => selectedValues.includes(item[valueKey]));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderDepartmentItem = (dept) => {
    const level = parseInt(dept.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
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
              {indent}
              {desc}
            </div>
            {name && name != desc && (
              <div
                className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap"
                style={{ marginLeft: `${(level - 1) * 20}px` }}
              >
                {indent}
                {name}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full ${
            Icon ? "pl-10" : "pl-4"
          } pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-left bg-white hover:bg-gray-50 transition-colors`}
        >
          {selectedValues.length > 0 ? (
            <span className="text-gray-900">
              {selectedValues.length} department(s) selected
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </button>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search departments...`}
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

          <div className="overflow-y-auto max-h-64">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Loader className="h-8 w-8 mx-auto animate-spin text-gray-400 mb-2" />
                <p>Loading departments...</p>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = selectedValues.includes(item[valueKey]);
                return (
                  <button
                    key={item[valueKey]}
                    type="button"
                    onClick={() => handleToggle(item[valueKey])}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 flex items-start ${
                      isSelected ? "bg-purple-50" : ""
                    }`}
                  >
                    <div
                      className={`w-4 h-4 mr-3 mt-1 border rounded flex-shrink-0 ${
                        isSelected
                          ? "bg-purple-600 border-purple-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">{renderDepartmentItem(item)}</div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No departments found</p>
              </div>
            )}
          </div>

          {selectedValues.length > 0 && (
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {getSelectedItems().map((item) => (
                  <span
                    key={item[valueKey]}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {item[displayKey]}
                    <button
                      type="button"
                      onClick={() => handleToggle(item[valueKey])}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AddEditEmployeeMaster = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Tree-structured data for departments
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);

  // Dropdown data states
  const [departments, setDepartments] = useState([]);
  const [employeeCategories, setEmployeeCategories] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);

  // Employee Category dropdown states
  const [filteredEmployeeCategories, setFilteredEmployeeCategories] = useState(
    []
  );
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categoryHighlightedIndex, setCategoryHighlightedIndex] = useState(-1);
  const categoryDropdownRef = useRef(null);
  const categorySearchRef = useRef(null);
  const categoryButtonRef = useRef(null);
  const categoryItemRefs = useRef([]);
  const categoryListRef = useRef(null);

  // Quota dropdown states
  const [filteredQuotas, setFilteredQuotas] = useState([]);
  const [quotaSearchTerm, setQuotaSearchTerm] = useState("");
  const [isQuotaDropdownOpen, setIsQuotaDropdownOpen] = useState(false);
  const [quotaHighlightedIndex, setQuotaHighlightedIndex] = useState(-1);
  const quotaDropdownRef = useRef(null);
  const quotaSearchRef = useRef(null);
  const quotaButtonRef = useRef(null);
  const quotaItemRefs = useRef([]);
  const quotaListRef = useRef(null);

  // Employee Type dropdown states
  const [filteredEmployeeTypes, setFilteredEmployeeTypes] = useState([]);
  const [empTypeSearchTerm, setEmpTypeSearchTerm] = useState("");
  const [isEmpTypeDropdownOpen, setIsEmpTypeDropdownOpen] = useState(false);
  const [empTypeHighlightedIndex, setEmpTypeHighlightedIndex] = useState(-1);
  const empTypeDropdownRef = useRef(null);
  const empTypeSearchRef = useRef(null);
  const empTypeButtonRef = useRef(null);
  const empTypeItemRefs = useRef([]);
  const empTypeListRef = useRef(null);

  // User dropdown states
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userHighlightedIndex, setUserHighlightedIndex] = useState(-1);
  const userDropdownRef = useRef(null);
  const userSearchRef = useRef(null);
  const userButtonRef = useRef(null);
  const userItemRefs = useRef([]);
  const userListRef = useRef(null);

  // Languages dropdown states (multi-select)
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [languageSearchTerm, setLanguageSearchTerm] = useState("");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [languageHighlightedIndex, setLanguageHighlightedIndex] = useState(-1);
  const languageDropdownRef = useRef(null);
  const languageSearchRef = useRef(null);
  const languageButtonRef = useRef(null);
  const languageItemRefs = useRef([]);
  const languageListRef = useRef(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Refs for focus management
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const empCodeRef = useRef(null);
  const birthDateRef = useRef(null);
  const panRef = useRef(null);
  const aadharRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const altPhoneRef = useRef(null);
  const genderRef = useRef(null);
  const address1Ref = useRef(null);
  const address2Ref = useRef(null);
  const address3Ref = useRef(null);
  const bankAcNoRef = useRef(null);
  const bankNameRef = useRef(null);
  const bankBranchRef = useRef(null);
  const bankAcTypeRef = useRef(null);
  const gpfPrefixRef = useRef(null);
  const gpfNoRef = useRef(null);
  const cpfNoRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const saveButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    Emp_Code: "",
    First_Name: "",
    Last_Name: "",
    Dpt_Id: [], // CHANGED: Array for multiple departments
    ECt_Id: "",
    Qut_Id: "",
    ETy_Id: "",
    Usr_Id: "",
    ELg_Id: [],
    Phone: "",
    Email_Id: "",
    Dsg_Id: "",
    Alt_Phone: "",
    F_M: "",
    Emp_Add1: "",
    Emp_Add2: "",
    Emp_Add3: "",
    Birth_Date: "",
    Bank_AcNo: "",
    Bank_Name: "",
    Bank_Br_Name: "",
    BkAc_Type: "",
    Gpf_AcNo_Pref: "",
    Gpf_AcNo: "",
    Cpf_AcNo: "",
    Inc_TxNo: "",
    UID_AdharNo: "",
    Is_Active: true,
  });

  const [errors, setErrors] = useState({});

  // =============  BUILD TREE STRUCTURE FOR DEPARTMENTS ==============
  const buildDepartmentTree = (departments) => {
    const map = {};
    const roots = [];

    departments.forEach((dept) => {
      map[dept.Dpt_id] = {
        ...dept,
        children: [],
        Dpt_id: dept.Dpt_id,
        Dpt_Name: dept.Dpt_Name,
        Dpt_Desc: dept.Dpt_Desc,
        GrStt: dept.GrStt,
        GrCod: dept.GrCod,
        UpGrp: dept.UpGrp,
      };
    });

    departments.forEach((dept) => {
      const deptId = dept.Dpt_id;
      const upGroup = dept.UpGrp;
      const currentDept = map[deptId];

      if (currentDept && upGroup && map[upGroup] && upGroup != deptId) {
        map[upGroup].children.push(currentDept);
      } else if (currentDept) {
        roots.push(currentDept);
      }
    });

    return roots;
  };

  // =============  FLATTEN TREE FOR DISPLAY ==============
  const flattenTree = (nodes, level = 1, result = []) => {
    nodes.forEach((node) => {
      result.push({ ...node, treeLevel: level });
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, level + 1, result);
      }
    });
    return result;
  };

  // =============  GENERAL KEYBOARD NAVIGATION FOR ENTER KEY ==============
  const handleEnterKey = (e, nextRef) => {
    if (e.key == "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // =============  DEPARTMENT MULTI-SELECT HANDLER ==============
  const handleDepartmentSelect = (selectedIds) => {
    setFormData((prev) => ({
      ...prev,
      Dpt_Id: selectedIds,
    }));

    if (errors.Dpt_Id) {
      setErrors((prev) => ({ ...prev, Dpt_Id: null }));
    }
  };

  // =============  EMPLOYEE CATEGORY KEYBOARD HANDLERS ==============
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
      if (filteredEmployeeCategories.length > 0) {
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
      if (
        filteredEmployeeCategories.length > 0 &&
        categoryHighlightedIndex >= 0
      ) {
        handleCategorySelect(
          filteredEmployeeCategories[categoryHighlightedIndex]
        );
      } else if (filteredEmployeeCategories.length > 0) {
        handleCategorySelect(filteredEmployeeCategories[0]);
      }
    }
  };

  const handleCategoryItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredEmployeeCategories.length) {
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
      handleCategorySelect(item);
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
      ECt_Id: category.value?.toString(),
    }));
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm("");
    setCategoryHighlightedIndex(-1);

    if (errors.ECt_Id) {
      setErrors((prev) => ({ ...prev, ECt_Id: null }));
    }

    setTimeout(() => {
      if (quotaButtonRef.current) {
        quotaButtonRef.current.focus();
      }
    }, 100);
  };

  const renderCategoryItem = (category) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{category.ECt_Name}</div>
    </div>
  );

  const getSelectedCategoryDisplay = () => {
    if (!formData.ECt_Id) return "";
    const selected = employeeCategories.find(
      (cat) => cat.value?.toString() == formData.ECt_Id
    );
    return selected ? selected.label : "";
  };

  // =============  QUOTA KEYBOARD HANDLERS ==============
  const handleQuotaKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsQuotaDropdownOpen(true);
      setQuotaSearchTerm("");
      setQuotaHighlightedIndex(-1);
      setTimeout(() => quotaSearchRef.current?.focus(), 0);
    }
  };

  const handleQuotaSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredQuotas.length > 0) {
        setQuotaHighlightedIndex(0);
        setTimeout(() => {
          if (quotaItemRefs.current[0]) {
            quotaItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsQuotaDropdownOpen(false);
      setQuotaHighlightedIndex(-1);
      setQuotaSearchTerm("");
      quotaButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredQuotas.length > 0 && quotaHighlightedIndex >= 0) {
        handleQuotaSelect(filteredQuotas[quotaHighlightedIndex]);
      } else if (filteredQuotas.length > 0) {
        handleQuotaSelect(filteredQuotas[0]);
      }
    }
  };

  const handleQuotaItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredQuotas.length) {
        setQuotaHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (quotaItemRefs.current[nextIndex]) {
            quotaItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setQuotaHighlightedIndex(-1);
        setTimeout(() => quotaSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setQuotaHighlightedIndex(-1);
        setTimeout(() => quotaSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setQuotaHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (quotaItemRefs.current[prevIndex]) {
            quotaItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleQuotaSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsQuotaDropdownOpen(false);
      setQuotaHighlightedIndex(-1);
      setQuotaSearchTerm("");
      quotaButtonRef.current?.focus();
    }
  };

  const handleQuotaSelect = (quota) => {
    setFormData((prev) => ({
      ...prev,
      Qut_Id: quota.value?.toString(),
    }));
    setIsQuotaDropdownOpen(false);
    setQuotaSearchTerm("");
    setQuotaHighlightedIndex(-1);

    if (errors.Qut_Id) {
      setErrors((prev) => ({ ...prev, Qut_Id: null }));
    }

    setTimeout(() => {
      if (empTypeButtonRef.current) {
        empTypeButtonRef.current.focus();
      }
    }, 100);
  };

  const renderQuotaItem = (quota) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{quota.Qut_Name}</div>
    </div>
  );

  const getSelectedQuotaDisplay = () => {
    if (!formData.Qut_Id) return "";
    const selected = quotas.find((q) => q.value?.toString() == formData.Qut_Id);
    return selected ? selected.label : "";
  };

  // =============  EMPLOYEE TYPE KEYBOARD HANDLERS ==============
  const handleEmpTypeKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsEmpTypeDropdownOpen(true);
      setEmpTypeSearchTerm("");
      setEmpTypeHighlightedIndex(-1);
      setTimeout(() => empTypeSearchRef.current?.focus(), 0);
    }
  };

  const handleEmpTypeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredEmployeeTypes.length > 0) {
        setEmpTypeHighlightedIndex(0);
        setTimeout(() => {
          if (empTypeItemRefs.current[0]) {
            empTypeItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmpTypeDropdownOpen(false);
      setEmpTypeHighlightedIndex(-1);
      setEmpTypeSearchTerm("");
      empTypeButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredEmployeeTypes.length > 0 && empTypeHighlightedIndex >= 0) {
        handleEmpTypeSelect(filteredEmployeeTypes[empTypeHighlightedIndex]);
      } else if (filteredEmployeeTypes.length > 0) {
        handleEmpTypeSelect(filteredEmployeeTypes[0]);
      }
    }
  };

  const handleEmpTypeItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredEmployeeTypes.length) {
        setEmpTypeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (empTypeItemRefs.current[nextIndex]) {
            empTypeItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setEmpTypeHighlightedIndex(-1);
        setTimeout(() => empTypeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setEmpTypeHighlightedIndex(-1);
        setTimeout(() => empTypeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setEmpTypeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (empTypeItemRefs.current[prevIndex]) {
            empTypeItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleEmpTypeSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsEmpTypeDropdownOpen(false);
      setEmpTypeHighlightedIndex(-1);
      setEmpTypeSearchTerm("");
      empTypeButtonRef.current?.focus();
    }
  };

  const handleEmpTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      ETy_Id: type.value?.toString(),
    }));
    setIsEmpTypeDropdownOpen(false);
    setEmpTypeSearchTerm("");
    setEmpTypeHighlightedIndex(-1);

    if (errors.ETy_Id) {
      setErrors((prev) => ({ ...prev, ETy_Id: null }));
    }

    setTimeout(() => {
      if (userButtonRef.current) {
        userButtonRef.current.focus();
      }
    }, 100);
  };

  const renderEmpTypeItem = (type) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{type.ETy_Name}</div>
    </div>
  );

  const getSelectedEmpTypeDisplay = () => {
    if (!formData.ETy_Id) return "";
    const selected = employeeTypes.find(
      (t) => t.value?.toString() == formData.ETy_Id
    );
    return selected ? selected.label : "";
  };

  // =============  USER KEYBOARD HANDLERS ==============
  const handleUserKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsUserDropdownOpen(true);
      setUserSearchTerm("");
      setUserHighlightedIndex(-1);
      setTimeout(() => userSearchRef.current?.focus(), 0);
    }
  };

  const handleUserSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredUsers.length > 0) {
        setUserHighlightedIndex(0);
        setTimeout(() => {
          if (userItemRefs.current[0]) {
            userItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsUserDropdownOpen(false);
      setUserHighlightedIndex(-1);
      setUserSearchTerm("");
      userButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredUsers.length > 0 && userHighlightedIndex >= 0) {
        handleUserSelect(filteredUsers[userHighlightedIndex]);
      } else if (filteredUsers.length > 0) {
        handleUserSelect(filteredUsers[0]);
      }
    }
  };

  const handleUserItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredUsers.length) {
        setUserHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (userItemRefs.current[nextIndex]) {
            userItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setUserHighlightedIndex(-1);
        setTimeout(() => userSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setUserHighlightedIndex(-1);
        setTimeout(() => userSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setUserHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (userItemRefs.current[prevIndex]) {
            userItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleUserSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsUserDropdownOpen(false);
      setUserHighlightedIndex(-1);
      setUserSearchTerm("");
      userButtonRef.current?.focus();
    }
  };

  const handleUserSelect = (user) => {
    setFormData((prev) => ({
      ...prev,
      Usr_Id: user.value?.toString(),
    }));
    setIsUserDropdownOpen(false);
    setUserSearchTerm("");
    setUserHighlightedIndex(-1);

    if (errors.Usr_Id) {
      setErrors((prev) => ({ ...prev, Usr_Id: null }));
    }

    setTimeout(() => {
      if (languageButtonRef.current) {
        languageButtonRef.current.focus();
      }
    }, 100);
  };

  const renderUserItem = (user) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{user.Usr_Name}</div>
    </div>
  );

  const getSelectedUserDisplay = () => {
    if (!formData.Usr_Id) return "";
    const selected = users.find((u) => u.value?.toString() == formData.Usr_Id);
    return selected ? selected.label : "";
  };

  // =============  LANGUAGE MULTI-SELECT HANDLERS ==============
  const handleLanguageKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsLanguageDropdownOpen(true);
      setLanguageSearchTerm("");
      setLanguageHighlightedIndex(-1);
      setTimeout(() => languageSearchRef.current?.focus(), 0);
    }
  };

  const handleLanguageSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredLanguages.length > 0) {
        setLanguageHighlightedIndex(0);
        setTimeout(() => {
          if (languageItemRefs.current[0]) {
            languageItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLanguageDropdownOpen(false);
      setLanguageHighlightedIndex(-1);
      setLanguageSearchTerm("");
      languageButtonRef.current?.focus();
    }
  };

  const handleLanguageItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredLanguages.length) {
        setLanguageHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (languageItemRefs.current[nextIndex]) {
            languageItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setLanguageHighlightedIndex(-1);
        setTimeout(() => languageSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setLanguageHighlightedIndex(-1);
        setTimeout(() => languageSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setLanguageHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (languageItemRefs.current[prevIndex]) {
            languageItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter" || e.key == " ") {
      e.preventDefault();
      handleLanguageToggle(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsLanguageDropdownOpen(false);
      setLanguageHighlightedIndex(-1);
      setLanguageSearchTerm("");
      languageButtonRef.current?.focus();
    }
  };

  const handleLanguageToggle = (lang) => {
    setFormData((prev) => {
      const currentIds = [...prev.ELg_Id];

      if (currentIds.includes(lang.value)) {
        return {
          ...prev,
          ELg_Id: currentIds.filter((id) => id != lang.value),
        };
      } else {
        return {
          ...prev,
          ELg_Id: [...currentIds, lang.value],
        };
      }
    });

    if (errors.ELg_Id) {
      setErrors((prev) => ({ ...prev, ELg_Id: null }));
    }
  };

  const renderLanguageItem = (lang) => {
    const isSelected = formData.ELg_Id.includes(lang.value);
    return (
      <div className="flex items-center py-1">
        <div
          className={`w-4 h-4 mr-2 border rounded flex-shrink-0 ${
            isSelected ? "bg-purple-600 border-purple-600" : "border-gray-300"
          }`}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{lang.Elg_Name}</div>
        </div>
      </div>
    );
  };

  const getSelectedLanguageDisplay = () => {
    if (selectedLanguages.length == 0) return "";
    return `${selectedLanguages.length} language(s) selected`;
  };

  // =============  LOAD DATA ==============
  useEffect(() => {
    loadDropdownData();

    if (id && id != "create") {
      setIsEditMode(true);
      loadEmployeeData();
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
        setCategoryHighlightedIndex(-1);
        setCategorySearchTerm("");
      }
      if (
        quotaDropdownRef.current &&
        !quotaDropdownRef.current.contains(event.target)
      ) {
        setIsQuotaDropdownOpen(false);
        setQuotaHighlightedIndex(-1);
        setQuotaSearchTerm("");
      }
      if (
        empTypeDropdownRef.current &&
        !empTypeDropdownRef.current.contains(event.target)
      ) {
        setIsEmpTypeDropdownOpen(false);
        setEmpTypeHighlightedIndex(-1);
        setEmpTypeSearchTerm("");
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
        setUserHighlightedIndex(-1);
        setUserSearchTerm("");
      }
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setIsLanguageDropdownOpen(false);
        setLanguageHighlightedIndex(-1);
        setLanguageSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id]);

  // Focus on first name field after loading
  useEffect(() => {
    if (!loading && !isEditMode) {
      setTimeout(() => firstNameRef.current?.focus(), 100);
    }
  }, [loading, isEditMode]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isCategoryDropdownOpen && categorySearchRef.current) {
      setTimeout(() => categorySearchRef.current.focus(), 0);
    }
  }, [isCategoryDropdownOpen]);

  useEffect(() => {
    if (isQuotaDropdownOpen && quotaSearchRef.current) {
      setTimeout(() => quotaSearchRef.current.focus(), 0);
    }
  }, [isQuotaDropdownOpen]);

  useEffect(() => {
    if (isEmpTypeDropdownOpen && empTypeSearchRef.current) {
      setTimeout(() => empTypeSearchRef.current.focus(), 0);
    }
  }, [isEmpTypeDropdownOpen]);

  useEffect(() => {
    if (isUserDropdownOpen && userSearchRef.current) {
      setTimeout(() => userSearchRef.current.focus(), 0);
    }
  }, [isUserDropdownOpen]);

  useEffect(() => {
    if (isLanguageDropdownOpen && languageSearchRef.current) {
      setTimeout(() => languageSearchRef.current.focus(), 0);
    }
  }, [isLanguageDropdownOpen]);

  // Scroll highlighted item into view
  const scrollIntoView = (container, items, highlightedIndex, isOpen) => {
    if (isOpen && highlightedIndex >= 0 && container) {
      const containerEl = container.current;
      const item = items.current[highlightedIndex];
      if (item) {
        const containerRect = containerEl.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        if (itemRect.bottom > containerRect.bottom) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  };

  useEffect(() => {
    scrollIntoView(
      categoryListRef,
      categoryItemRefs,
      categoryHighlightedIndex,
      isCategoryDropdownOpen
    );
  }, [categoryHighlightedIndex, isCategoryDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      quotaListRef,
      quotaItemRefs,
      quotaHighlightedIndex,
      isQuotaDropdownOpen
    );
  }, [quotaHighlightedIndex, isQuotaDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      empTypeListRef,
      empTypeItemRefs,
      empTypeHighlightedIndex,
      isEmpTypeDropdownOpen
    );
  }, [empTypeHighlightedIndex, isEmpTypeDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      userListRef,
      userItemRefs,
      userHighlightedIndex,
      isUserDropdownOpen
    );
  }, [userHighlightedIndex, isUserDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      languageListRef,
      languageItemRefs,
      languageHighlightedIndex,
      isLanguageDropdownOpen
    );
  }, [languageHighlightedIndex, isLanguageDropdownOpen]);

  // Filter departments with hierarchy
  useEffect(() => {
    if (!departments.length) {
      return;
    }

    const tree = buildDepartmentTree(departments);
    const flattened = flattenTree(tree);
    setFlattenedDepartments(flattened);
  }, [departments]);

  // Filter employee categories
  useEffect(() => {
    if (!categorySearchTerm.trim()) {
      setFilteredEmployeeCategories(employeeCategories);
    } else {
      const term = categorySearchTerm.toLowerCase();
      const filtered = employeeCategories.filter(
        (category) =>
          category.ECt_Name?.toLowerCase().includes(term) ||
          category.ECt_Code?.toLowerCase().includes(term)
      );
      setFilteredEmployeeCategories(filtered);
    }
    setCategoryHighlightedIndex(-1);
  }, [categorySearchTerm, employeeCategories]);

  // Filter quotas
  useEffect(() => {
    if (!quotaSearchTerm.trim()) {
      setFilteredQuotas(quotas);
    } else {
      const term = quotaSearchTerm.toLowerCase();
      const filtered = quotas.filter(
        (quota) =>
          quota.Qut_Name?.toLowerCase().includes(term) ||
          quota.Qut_Code?.toLowerCase().includes(term)
      );
      setFilteredQuotas(filtered);
    }
    setQuotaHighlightedIndex(-1);
  }, [quotaSearchTerm, quotas]);

  // Filter employee types
  useEffect(() => {
    if (!empTypeSearchTerm.trim()) {
      setFilteredEmployeeTypes(employeeTypes);
    } else {
      const term = empTypeSearchTerm.toLowerCase();
      const filtered = employeeTypes.filter((type) =>
        type.ETy_Name?.toLowerCase().includes(term)
      );
      setFilteredEmployeeTypes(filtered);
    }
    setEmpTypeHighlightedIndex(-1);
  }, [empTypeSearchTerm, employeeTypes]);

  // Filter users
  useEffect(() => {
    if (!userSearchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const term = userSearchTerm.toLowerCase();
      const filtered = users.filter((user) =>
        user.Usr_Name?.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
    setUserHighlightedIndex(-1);
  }, [userSearchTerm, users]);

  // Filter languages
  useEffect(() => {
    if (!languageSearchTerm.trim()) {
      setFilteredLanguages(languages);
    } else {
      const term = languageSearchTerm.toLowerCase();
      const filtered = languages.filter(
        (lang) =>
          lang.Elg_Name?.toLowerCase().includes(term) ||
          lang.ELg_Code?.toLowerCase().includes(term)
      );
      setFilteredLanguages(filtered);
    }
    setLanguageHighlightedIndex(-1);
  }, [languageSearchTerm, languages]);

  // Update selectedLanguages when formData.ELg_Id changes
  useEffect(() => {
    const selected = languages.filter((lang) =>
      formData.ELg_Id.includes(lang.value)
    );
    setSelectedLanguages(selected);
  }, [formData.ELg_Id, languages]);

  const loadDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const dropdownData = await EmployeeMasterApi.getAllDropdownData();

      // Process departments
      if (dropdownData.departments) {
        const deptOptions = dropdownData.departments.map((dept) => ({
          Dpt_id: dept.Dpt_id,
          Dpt_Name: dept.Dpt_Name,
          Dpt_Desc: dept.Dpt_Desc,
          GrCod: dept.GrCod || dept.Dpt_Desc,
          GrStt: dept.GrStt || 1,
          UpGrp: dept.UpGrp || null,
        }));
        setDepartments(deptOptions);
      }

      // Process employee categories
      if (dropdownData.employeeCategories) {
        const categoryOptions = dropdownData.employeeCategories.map(
          (category) => ({
            value: category.ECt_Id,
            label: `${category.ECt_Name} (${category.ECt_Code})`,
            ECt_Name: category.ECt_Name,
          })
        );
        setEmployeeCategories(categoryOptions);
        setFilteredEmployeeCategories(categoryOptions);
      }

      // Process quotas
      if (dropdownData.quotas) {
        const quotaOptions = dropdownData.quotas.map((quota) => ({
          value: quota.Qut_Id,
          label: `${quota.Qut_Name} (${quota.Qut_Code})`,
          Qut_Name: quota.Qut_Name,
        }));
        setQuotas(quotaOptions);
        setFilteredQuotas(quotaOptions);
      }

      // Process designations (role)
      if (dropdownData.designations) {
        setDesignations(dropdownData.designations);
        setLoadingDesignations(false);
      }

      // Process employee types
      if (dropdownData.employeeTypes) {
        const typeOptions = dropdownData.employeeTypes.map((type) => ({
          value: type.ETy_Id,
          label: type.ETy_Name,
          ETy_Name: type.ETy_Name,
        }));
        setEmployeeTypes(typeOptions);
        setFilteredEmployeeTypes(typeOptions);
      }

      // Process users
      if (dropdownData.users) {
        // Devotee/Applicant user Employee Master me nahi dikhne chahiye.
        const eligibleUsers = dropdownData.users.filter(
          (user) => !user.is_devotee,
        );
        const userOptions = eligibleUsers.map((user) => ({
          value: user.Usr_Id,
          label: user.Usr_Name,
          Usr_Name: user.Usr_Name,
        }));
        setUsers(userOptions);
        setFilteredUsers(userOptions);
      }

      // Process languages
      if (dropdownData.languages) {
        const langOptions = dropdownData.languages.map((lang) => ({
          value: lang.ELg_Id,
          label: `${lang.Elg_Name}${
            lang.ELg_Code ? ` (${lang.ELg_Code})` : ""
          }`,
          Elg_Name: lang.Elg_Name,
        }));
        setLanguages(langOptions);
        setFilteredLanguages(langOptions);
      }
    } catch (error) {
      console.error("Error loading dropdown data:", error);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      const response = await EmployeeMasterApi.getById(id);
      if (response.status && response.data) {
        const employee = response.data;
        setFormData({
          Emp_Code: employee.Emp_Code || "",
          First_Name: employee.First_Name || "",
          Last_Name: employee.Last_Name || "",
          Dpt_Id: employee.Dpt_Id || [], // CHANGED: Keep as array from API
          ECt_Id: employee.Ect_Id ? employee.Ect_Id.toString() : "",
          Qut_Id: employee.Qut_Id ? employee.Qut_Id.toString() : "",
          ETy_Id: employee.ETy_Id ? employee.ETy_Id.toString() : "",
          Usr_Id: employee.Usr_Id ? employee.Usr_Id.toString() : "",
          ELg_Id: employee.ELg_Id || [],
          Phone: employee.Phone || "",
          Email_Id: employee.Email_Id || "",
          Alt_Phone: employee.Alt_Phone || "",
          F_M: employee.F_M || "",
          Emp_Add1: employee.Emp_Add1 || "",
          Emp_Add2: employee.Emp_Add2 || "",
          Emp_Add3: employee.Emp_Add3 || "",
          Birth_Date: employee.Birth_Date
            ? employee.Birth_Date.split("T")[0]
            : "",
          Bank_AcNo: employee.Bank_AcNo || "",
          Bank_Name: employee.Bank_Name || "",
          Bank_Br_Name: employee.Bank_Br_Name || "",
          BkAc_Type: employee.BkAc_Type || "",
          Gpf_AcNo_Pref: employee.Gpf_AcNo_Pref || "",
          Gpf_AcNo: employee.Gpf_AcNo || "",
          Cpf_AcNo: employee.Cpf_AcNo || "",
          Inc_TxNo: employee.Inc_TxNo || "",
          UID_AdharNo: employee.UID_AdharNo || "",
          Is_Active: employee.Is_Active == true || employee.Is_Active == 1,
        });
      } else {
        toast.error("Failed to load employee data!");
        navigate("/masters/employee-records/employee-master");
      }
    } catch (error) {
      console.error("Error loading employee:", error);
      toast.error("Failed to load employee data!");
      navigate("/masters/employee-records/employee-master");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.First_Name?.trim()) {
      newErrors.First_Name = "First name is required";
    } else if (formData.First_Name.length > 50) {
      newErrors.First_Name = `Maximum 50 characters allowed (${formData.First_Name.length}/50)`;
    }

    if (formData.Last_Name && formData.Last_Name.length > 50) {
      newErrors.Last_Name = `Maximum 50 characters allowed (${formData.Last_Name.length}/50)`;
    }

    if (formData.Emp_Code && formData.Emp_Code.length > 20) {
      newErrors.Emp_Code = `Maximum 20 characters allowed (${formData.Emp_Code.length}/20)`;
    }

    if (formData.Phone && !/^\d{10}$/.test(formData.Phone)) {
      newErrors.Phone = "Phone number must be 10 digits";
    }

    if (formData.Alt_Phone && !/^\d{10}$/.test(formData.Alt_Phone)) {
      newErrors.Alt_Phone = "Alternate phone must be 10 digits";
    }

    if (
      formData.Email_Id &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email_Id)
    ) {
      newErrors.Email_Id = "Please enter a valid email address";
    }

    if (
      formData.Inc_TxNo &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.Inc_TxNo)
    ) {
      newErrors.Inc_TxNo = "Please enter a valid PAN number";
    }

    if (formData.UID_AdharNo && !/^\d{12}$/.test(formData.UID_AdharNo)) {
      newErrors.UID_AdharNo = "Aadhar number must be 12 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length == 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    const result = await Swal.fire({
      title: isEditMode ? "Update Employee?" : "Create New Employee?",
      text: isEditMode
        ? "Are you sure you want to update this employee?"
        : "Are you sure you want to create this new employee?",
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
        Emp_Code: formData.Emp_Code || "",
        First_Name: formData.First_Name,
        Last_Name: formData.Last_Name || null,
        Dpt_Id: formData.Dpt_Id, // CHANGED: Sends array directly
        Ect_Id: formData.ECt_Id || null,
        Qut_Id: formData.Qut_Id || null,
        ETy_Id: formData.ETy_Id || null,
        Usr_Id: formData.Usr_Id || null,
        ELg_Id: formData.ELg_Id,
        Phone: formData.Phone || null,
        Email_Id: formData.Email_Id || null,
        Dsg_Id: formData.Dsg_Id || null,
        Alt_Phone: formData.Alt_Phone || null,
        F_M: formData.F_M || null,
        Emp_Add1: formData.Emp_Add1 || null,
        Emp_Add2: formData.Emp_Add2 || null,
        Emp_Add3: formData.Emp_Add3 || null,
        Birth_Date: formData.Birth_Date || null,
        Bank_AcNo: formData.Bank_AcNo || null,
        Bank_Name: formData.Bank_Name || null,
        Bank_Br_Name: formData.Bank_Br_Name || null,
        BkAc_Type: formData.BkAc_Type || null,
        Gpf_AcNo_Pref: formData.Gpf_AcNo_Pref || null,
        Gpf_AcNo: formData.Gpf_AcNo || null,
        Cpf_AcNo: formData.Cpf_AcNo || null,
        Inc_TxNo: formData.Inc_TxNo || null,
        UID_AdharNo: formData.UID_AdharNo || null,
        Is_Active: formData.Is_Active,
      };

      if (isEditMode) {
        await EmployeeMasterApi.update(id, submitData);
        toast.success("Employee updated successfully!");
      } else {
        await EmployeeMasterApi.create(submitData);
        toast.success("Employee created successfully!");
      }

      setTimeout(() => {
        navigate("/masters/employee-records/employee-master");
      }, 1500);
    } catch (error) {
      console.error("Error saving employee:", error);

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
            ? "Failed to update. Please try again."
            : "Failed to create. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/masters/employee-records/employee-master");
  };

  if (loading || loadingDropdowns) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() =>
              navigate("/masters/employee-records/employee-master")
            }
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Employee" : "Add New Employee"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update employee information"
                : "Create a new employee in the system"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <User className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstNameRef}
                type="text"
                name="First_Name"
                value={formData.First_Name}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, lastNameRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.First_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Rahul"
                maxLength={50}
              />
              {errors.First_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.First_Name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                ref={lastNameRef}
                type="text"
                name="Last_Name"
                value={formData.Last_Name}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, empCodeRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Last_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Sharma"
                maxLength={50}
              />
              {errors.Last_Name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Last_Name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Code
              </label>
              <input
                ref={empCodeRef}
                type="text"
                name="Emp_Code"
                value={formData.Emp_Code}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, birthDateRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.Emp_Code ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., EMP001"
                maxLength={20}
              />
              {errors.Emp_Code && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Emp_Code}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date
              </label>
              <input
                ref={birthDateRef}
                type="date"
                name="Birth_Date"
                value={formData.Birth_Date}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, panRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.Birth_Date ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.Birth_Date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Birth_Date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PAN Number
              </label>
              <input
                ref={panRef}
                type="text"
                name="Inc_TxNo"
                value={formData.Inc_TxNo}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, aadharRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.Inc_TxNo ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
              {errors.Inc_TxNo && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Inc_TxNo}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aadhar Number
              </label>
              <input
                ref={aadharRef}
                type="text"
                name="UID_AdharNo"
                value={formData.UID_AdharNo}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, emailRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.UID_AdharNo ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="123412341234"
                maxLength={12}
              />
              {errors.UID_AdharNo && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.UID_AdharNo}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
              <Phone className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={emailRef}
                  type="email"
                  name="Email_Id"
                  value={formData.Email_Id}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, phoneRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.Email_Id ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="rahul.sharma@example.com"
                />
              </div>
              {errors.Email_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Email_Id}
                </p>
              )}
            </div>

            {/* Designation = Role. Isse user_master me user auto-create hota hai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation (Role) *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="Dsg_Id"
                  value={formData.Dsg_Id}
                  onChange={handleInputChange}
                  disabled={loadingDesignations}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white ${
                    errors.Dsg_Id ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">
                    {loadingDesignations ? "Loading designations..." : "Select designation"}
                  </option>
                  {designations.map((d) => (
                    <option key={d.Dsg_id} value={d.Dsg_id}>
                      {d.Dsg_Desc || d.Dsg_Title}
                      {d.Dsg_EName ? ` (${d.Dsg_EName})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {errors.Dsg_Id && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Dsg_Id}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                User account auto-create hoga, role = ye designation
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={phoneRef}
                  type="text"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, altPhoneRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.Phone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              {errors.Phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternate Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={altPhoneRef}
                  type="text"
                  name="Alt_Phone"
                  value={formData.Alt_Phone}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleEnterKey(e, genderRef)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.Alt_Phone ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="9123456780"
                  maxLength={10}
                />
              </div>
              {errors.Alt_Phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.Alt_Phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                ref={genderRef}
                name="F_M"
                value={formData.F_M}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, address1Ref)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.F_M ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.F_M && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.F_M}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center mr-3">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Address Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1
              </label>
              <input
                ref={address1Ref}
                type="text"
                name="Emp_Add1"
                value={formData.Emp_Add1}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, address2Ref)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.Emp_Add1 ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="123 MG Road"
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                ref={address2Ref}
                type="text"
                name="Emp_Add2"
                value={formData.Emp_Add2}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, address3Ref)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.Emp_Add2 ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Near City Mall"
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 3
              </label>
              <input
                ref={address3Ref}
                type="text"
                name="Emp_Add3"
                value={formData.Emp_Add3}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, null)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.Emp_Add3 ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Ahmedabad"
                maxLength={255}
              />
            </div>
          </div>
        </div>

        {/* Master Data Selections */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mr-3">
              <Building className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Master Data</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Department Field - MULTI-SELECT (CHANGED) */}
            <MultiSelectDropdown
              label="Department"
              selectedValues={formData.Dpt_Id}
              onChange={handleDepartmentSelect}
              items={departments}
              displayKey="Dpt_Name"
              valueKey="Dpt_id"
              loading={loadingDropdowns}
              placeholder="Select departments (multiple allowed)"
              icon={Building}
            />

            {/* Employee Category Dropdown */}
            <SearchableDropdown
              label="Employee Category"
              value={formData.ECt_Id}
              error={errors.ECt_Id}
              icon={PieChart}
              isOpen={isCategoryDropdownOpen}
              setIsOpen={setIsCategoryDropdownOpen}
              searchTerm={categorySearchTerm}
              setSearchTerm={setCategorySearchTerm}
              items={employeeCategories}
              filteredItems={filteredEmployeeCategories}
              highlightedIndex={categoryHighlightedIndex}
              onSelect={handleCategorySelect}
              onKeyDown={handleCategoryKeyDown}
              onSearchKeyDown={handleCategorySearchKeyDown}
              onItemKeyDown={handleCategoryItemKeyDown}
              getSelectedDisplay={getSelectedCategoryDisplay}
              loading={loadingDropdowns}
              placeholder="Select Category"
              searchPlaceholder="Search by category name or code..."
              buttonRef={categoryButtonRef}
              dropdownRef={categoryDropdownRef}
              searchRef={categorySearchRef}
              itemRefs={categoryItemRefs}
              listRef={categoryListRef}
              renderItem={renderCategoryItem}
              totalCount={employeeCategories.length}
            />

            {/* Quota Dropdown */}
            <SearchableDropdown
              label="Quota"
              value={formData.Qut_Id}
              error={errors.Qut_Id}
              icon={Layers}
              isOpen={isQuotaDropdownOpen}
              setIsOpen={setIsQuotaDropdownOpen}
              searchTerm={quotaSearchTerm}
              setSearchTerm={setQuotaSearchTerm}
              items={quotas}
              filteredItems={filteredQuotas}
              highlightedIndex={quotaHighlightedIndex}
              onSelect={handleQuotaSelect}
              onKeyDown={handleQuotaKeyDown}
              onSearchKeyDown={handleQuotaSearchKeyDown}
              onItemKeyDown={handleQuotaItemKeyDown}
              getSelectedDisplay={getSelectedQuotaDisplay}
              loading={loadingDropdowns}
              placeholder="Select Quota"
              searchPlaceholder="Search by quota name or code..."
              buttonRef={quotaButtonRef}
              dropdownRef={quotaDropdownRef}
              searchRef={quotaSearchRef}
              itemRefs={quotaItemRefs}
              listRef={quotaListRef}
              renderItem={renderQuotaItem}
              totalCount={quotas.length}
            />

            {/* Employee Type Dropdown */}
            <SearchableDropdown
              label="Employee Type"
              value={formData.ETy_Id}
              error={errors.ETy_Id}
              icon={Briefcase}
              isOpen={isEmpTypeDropdownOpen}
              setIsOpen={setIsEmpTypeDropdownOpen}
              searchTerm={empTypeSearchTerm}
              setSearchTerm={setEmpTypeSearchTerm}
              items={employeeTypes}
              filteredItems={filteredEmployeeTypes}
              highlightedIndex={empTypeHighlightedIndex}
              onSelect={handleEmpTypeSelect}
              onKeyDown={handleEmpTypeKeyDown}
              onSearchKeyDown={handleEmpTypeSearchKeyDown}
              onItemKeyDown={handleEmpTypeItemKeyDown}
              getSelectedDisplay={getSelectedEmpTypeDisplay}
              loading={loadingDropdowns}
              placeholder="Select Employee Type"
              searchPlaceholder="Search by employee type..."
              buttonRef={empTypeButtonRef}
              dropdownRef={empTypeDropdownRef}
              searchRef={empTypeSearchRef}
              itemRefs={empTypeItemRefs}
              listRef={empTypeListRef}
              renderItem={renderEmpTypeItem}
              totalCount={employeeTypes.length}
            />

            {/* User Dropdown */}
            <SearchableDropdown
              label="User"
              value={formData.Usr_Id}
              error={errors.Usr_Id}
              icon={User}
              isOpen={isUserDropdownOpen}
              setIsOpen={setIsUserDropdownOpen}
              searchTerm={userSearchTerm}
              setSearchTerm={setUserSearchTerm}
              items={users}
              filteredItems={filteredUsers}
              highlightedIndex={userHighlightedIndex}
              onSelect={handleUserSelect}
              onKeyDown={handleUserKeyDown}
              onSearchKeyDown={handleUserSearchKeyDown}
              onItemKeyDown={handleUserItemKeyDown}
              getSelectedDisplay={getSelectedUserDisplay}
              loading={loadingDropdowns}
              placeholder="Select User"
              searchPlaceholder="Search by user name..."
              buttonRef={userButtonRef}
              dropdownRef={userDropdownRef}
              searchRef={userSearchRef}
              itemRefs={userItemRefs}
              listRef={userListRef}
              renderItem={renderUserItem}
              totalCount={users.length}
            />

            {/* Languages Multi-Select Dropdown */}
            <SearchableDropdown
              label="Languages Known"
              value={selectedLanguages.length > 0 ? "selected" : ""}
              error={errors.ELg_Id}
              icon={Globe}
              isOpen={isLanguageDropdownOpen}
              setIsOpen={setIsLanguageDropdownOpen}
              searchTerm={languageSearchTerm}
              setSearchTerm={setLanguageSearchTerm}
              items={languages}
              filteredItems={filteredLanguages}
              highlightedIndex={languageHighlightedIndex}
              onSelect={handleLanguageToggle}
              onKeyDown={handleLanguageKeyDown}
              onSearchKeyDown={handleLanguageSearchKeyDown}
              onItemKeyDown={handleLanguageItemKeyDown}
              getSelectedDisplay={getSelectedLanguageDisplay}
              loading={loadingDropdowns}
              placeholder="Select Languages"
              searchPlaceholder="Search languages..."
              buttonRef={languageButtonRef}
              dropdownRef={languageDropdownRef}
              searchRef={languageSearchRef}
              itemRefs={languageItemRefs}
              listRef={languageListRef}
              renderItem={renderLanguageItem}
              totalCount={languages.length}
            />
          </div>

          {/* Selected Languages Tags */}
          {selectedLanguages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedLanguages.map((lang) => (
                <span
                  key={lang.value}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {lang.Elg_Name}
                  <button
                    type="button"
                    onClick={() => handleLanguageToggle(lang)}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, ELg_Id: [] }))}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center mr-3">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Bank Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Account No
              </label>
              <input
                ref={bankAcNoRef}
                type="text"
                name="Bank_AcNo"
                value={formData.Bank_AcNo}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, bankNameRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.Bank_AcNo ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="123456789012"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                ref={bankNameRef}
                type="text"
                name="Bank_Name"
                value={formData.Bank_Name}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, bankBranchRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.Bank_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="SBI"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Branch
              </label>
              <input
                ref={bankBranchRef}
                type="text"
                name="Bank_Br_Name"
                value={formData.Bank_Br_Name}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, bankAcTypeRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.Bank_Br_Name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Ahmedabad Main Branch"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <input
                ref={bankAcTypeRef}
                type="text"
                name="BkAc_Type"
                value={formData.BkAc_Type}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, gpfPrefixRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.BkAc_Type ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Savings"
                maxLength={50}
              />
            </div>
          </div>
        </div>

        {/* PF/GPF Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mr-3">
              <Hash className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              PF/GPF Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPF Prefix
              </label>
              <input
                ref={gpfPrefixRef}
                type="text"
                name="Gpf_AcNo_Pref"
                value={formData.Gpf_AcNo_Pref}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, gpfNoRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.Gpf_AcNo_Pref ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="GPF"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPF Number
              </label>
              <input
                ref={gpfNoRef}
                type="text"
                name="Gpf_AcNo"
                value={formData.Gpf_AcNo}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, cpfNoRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.Gpf_AcNo ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="GPF12345"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF Number
              </label>
              <input
                ref={cpfNoRef}
                type="text"
                name="Cpf_AcNo"
                value={formData.Cpf_AcNo}
                onChange={handleInputChange}
                onKeyDown={(e) => handleEnterKey(e, saveButtonRef)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.Cpf_AcNo ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="CPF98765"
                maxLength={20}
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Status
          </label>
          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center cursor-pointer group">
              <input
                type="radio"
                name="Is_Active"
                checked={formData.Is_Active == true}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, Is_Active: true }))
                }
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Active
              </span>
            </label>
            <label className="inline-flex items-center cursor-pointer group">
              <input
                type="radio"
                name="Is_Active"
                checked={formData.Is_Active == false}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, Is_Active: false }))
                }
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                Inactive
              </span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
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
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Employee" : "Create Employee"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditEmployeeMaster;
