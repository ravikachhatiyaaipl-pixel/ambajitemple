import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiCheck,
  FiX,
  FiSearch,
  FiChevronDown,
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiDownload,
  FiTag,
} from "react-icons/fi";
import axios from "axios";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
  includeAllOption = false,
  allOptionLabel = "All Departments",
  allOptionValue = "all",
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
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          !disabled && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiChevronDown className="h-4 w-4" />
            </button>
          )
        )}

        {error && (
          <FiAlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ minWidth: "300px" }}
        >
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div
            ref={listRef}
            className="overflow-y-auto max-h-64"
            onWheel={handleWheel}
          >
            {includeAllOption && !searchTerm && (
              <button
                type="button"
                onClick={() => {
                  onSelect({
                    id: allOptionValue,
                    name: allOptionLabel,
                    isAllOption: true,
                  });
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                  value == allOptionValue
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }`}
                tabIndex={0}
              >
                <div className="flex items-center">
                  <FiFileText className="h-4 w-4 mr-2" />
                  <span className="font-medium">{allOptionLabel}</span>
                </div>
                {value == allOptionValue && (
                  <div className="text-xs text-blue-600 mt-1 flex items-center">
                    <FiCheck className="h-3 w-3 mr-1" />
                    Selected
                  </div>
                )}
              </button>
            )}

            {filteredItems && filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const itemId = item.id || item.Dpt_id || `item-${idx}`;

                return (
                  <button
                    key={itemId}
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
                        : value && itemId && value == itemId.toString()
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                    }`}
                    tabIndex={0}
                  >
                    {renderItem ? renderItem(item) : item.name}
                    {value && itemId && value == itemId.toString() && (
                      <div className="text-xs text-blue-600 mt-1 flex items-center">
                        <FiCheck className="h-3 w-3 mr-1" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <FiSearch className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No items found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredItems?.length || 0} items found</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <FiAlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// =============  BUILD TREE STRUCTURE FOR DEPARTMENTS ==============
const buildDepartmentTree = (depts) => {
  const map = {};
  const roots = [];

  // First, create a map of all departments
  depts.forEach((dept) => {
    map[dept.Dpt_id] = {
      ...dept,
      children: [],
      level: parseInt(dept.GrStt) || 1,
    };
  });

  // Then build the tree structure
  depts.forEach((dept) => {
    const currentDept = map[dept.Dpt_id];
    const parentGrp = dept.UpGrp;

    // Find parent where GrCod matches UpGrp
    const parent = Object.values(map).find(
      (d) => d.GrCod == parentGrp && d.Dpt_id != dept.Dpt_id,
    );

    if (parent && parentGrp != dept.GrCod) {
      parent.children.push(currentDept);
    } else if (currentDept.level == 1 || !parent) {
      roots.push(currentDept);
    }
  });

  return roots;
};

// =============  FLATTEN TREE FOR DISPLAY ==============
const flattenTree = (nodes, level = 1, result = []) => {
  nodes.forEach((node) => {
    result.push({
      ...node,
      treeLevel: level,
      displayName: `${"    ".repeat(level - 1)}${node.Dpt_Desc || node.Dpt_Name}`,
      id: node.Dpt_id,
      name: node.Dpt_Name,
      searchText: `${node.Dpt_Name} ${node.Dpt_Desc || ""}`,
      subText: node.Dpt_Desc,
    });
    if (node.children && node.children.length > 0) {
      flattenTree(node.children, level + 1, result);
    }
  });
  return result;
};

// =============  PAGINATION COMPONENT ==============
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 mt-4">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage == 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage == totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage == 1}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page == "number" && onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                  currentPage == page
                    ? "z-10 bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                } ${typeof page != "number" ? "cursor-default" : ""}`}
                disabled={typeof page != "number"}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage == totalPages}
              className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const DepartmentwiseActiveWorkOrders = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pageTitle, setPageTitle] = useState(
    "Departmentwise Active Work Orders Report",
  );
  const [pagination, setPagination] = useState(null);

  // Dropdown data states
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Filter states - Set default department to "all"
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appliedFilters, setAppliedFilters] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Search state for table
  const [searchTerm, setSearchTerm] = useState("");

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  // Excel export state
  const [exportingExcel, setExportingExcel] = useState(false);

  // Department dropdown states
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);
  const deptDropdownRef = useRef(null);
  const deptSearchRef = useRef(null);
  const deptItemRefs = useRef([]);
  const deptListRef = useRef(null);
  const deptButtonRef = useRef(null);

  // Vendor dropdown states
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [vendorHighlightedIndex, setVendorHighlightedIndex] = useState(-1);
  const vendorDropdownRef = useRef(null);
  const vendorSearchRef = useRef(null);
  const vendorItemRefs = useRef([]);
  const vendorListRef = useRef(null);
  const vendorButtonRef = useRef(null);

  const { organization } = useOrganization();

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/tender-management/departmentwise-active-wo";

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

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Close dropdowns when clicking outside
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
      if (
        vendorDropdownRef.current &&
        !vendorDropdownRef.current.contains(event.target)
      ) {
        setIsVendorDropdownOpen(false);
        setVendorHighlightedIndex(-1);
        setVendorSearchTerm("");
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

  useEffect(() => {
    if (isVendorDropdownOpen && vendorSearchRef.current) {
      setTimeout(() => vendorSearchRef.current.focus(), 0);
    }
  }, [isVendorDropdownOpen]);

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
      deptListRef,
      deptItemRefs,
      deptHighlightedIndex,
      isDeptDropdownOpen,
    );
  }, [deptHighlightedIndex, isDeptDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      vendorListRef,
      vendorItemRefs,
      vendorHighlightedIndex,
      isVendorDropdownOpen,
    );
  }, [vendorHighlightedIndex, isVendorDropdownOpen]);

  // Filter departments
  useEffect(() => {
    if (!flattenedDepartments.length) return;

    if (!deptSearchTerm.trim()) {
      setFilteredDepartments(flattenedDepartments);
    } else {
      const term = deptSearchTerm.toLowerCase();
      const filtered = flattenedDepartments.filter(
        (dept) =>
          (dept.Dpt_Desc?.toLowerCase() || "").includes(term) ||
          (dept.Dpt_Name?.toLowerCase() || "").includes(term) ||
          (dept.GrCod?.toLowerCase() || "").includes(term),
      );
      setFilteredDepartments(filtered);
    }
    setDeptHighlightedIndex(-1);
  }, [deptSearchTerm, flattenedDepartments]);

  // Filter vendors
  useEffect(() => {
    if (!vendorSearchTerm.trim()) {
      setFilteredVendors(vendors);
    } else {
      const term = vendorSearchTerm.toLowerCase();
      const filtered = vendors.filter(
        (vendor) =>
          vendor.name?.toLowerCase().includes(term) ||
          vendor.searchText?.toLowerCase().includes(term),
      );
      setFilteredVendors(filtered);
    }
    setVendorHighlightedIndex(-1);
  }, [vendorSearchTerm, vendors]);

  // Fetch all dropdown data
  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      // Fetch Departments with tree structure
      const deptResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );
      if (deptResponse.data?.success) {
        const activeDepartments = (deptResponse.data.data || []).filter(
          (dept) => dept.isvisible == 1 || dept.isvisible == "1",
        );

        const tree = buildDepartmentTree(activeDepartments);
        const flattened = flattenTree(tree);
        setDepartments(activeDepartments);
        setFlattenedDepartments(flattened);
        setFilteredDepartments(flattened);
      }

      // Fetch Vendors from Sub Ledgers
      const vendorResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/sub-ledgers/all`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );
      if (vendorResponse.data?.success) {
        const formattedVendors = vendorResponse.data.data.map((vendor) => ({
          id: vendor.SL_Id,
          name: vendor.SL_Name,
          searchText: `${vendor.SL_Name} ${vendor.SL_Code || ""} ${vendor.SL_Email || ""}`,
          subText: vendor.SL_Code
            ? `Code: ${vendor.SL_Code}`
            : vendor.SL_Email || "",
          original: vendor,
        }));
        setVendors(formattedVendors);
        setFilteredVendors(formattedVendors);
      }
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      setMessage({
        text: "Error loading filter options",
        type: "error",
      });
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedFilters(null);
    setEntries([]);
    setSummary(null);
    setPagination(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setSelectedDepartment("all"); // Reset to "all" instead of empty
    setSelectedVendor("");
    setFromDate("");
    setToDate("");
    setDeptSearchTerm("");
    setVendorSearchTerm("");
    setSearchTerm("");
    invalidateReport();
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name == "from_date") {
      setFromDate(value);
    } else if (name == "to_date") {
      setToDate(value);
    }
    if (hasGenerated) invalidateReport();
  };

  // Department keyboard handlers
  const handleDeptKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      if (!isDeptDropdownOpen) {
        setIsDeptDropdownOpen(true);
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
      handleDeptSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      deptButtonRef.current?.focus();
    }
  };

  const handleDeptSelect = (dept) => {
    if (dept && dept.isAllOption) {
      setSelectedDepartment("all");
    } else if (dept && dept.id) {
      setSelectedDepartment(dept.id.toString());
    }
    setIsDeptDropdownOpen(false);
    setDeptSearchTerm("");
    setDeptHighlightedIndex(-1);
    if (hasGenerated) invalidateReport();
  };

  const getSelectedDeptDisplay = () => {
    if (selectedDepartment == "all") return "All Departments";
    if (!selectedDepartment) return "";
    const selected = flattenedDepartments.find(
      (dept) => dept.id?.toString() == selectedDepartment,
    );
    if (!selected) return "Selected department not found";

    const level = selected.treeLevel || parseInt(selected.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = selected.Dpt_Desc || selected.desc || "No Description";
    const name = selected.Dpt_Name || selected.name;

    if (name && name != desc) {
      return `${indent}${desc} (${name})`;
    }
    return `${indent}${desc}`;
  };

  const renderDepartmentItem = (dept) => {
    const level = dept.treeLevel || parseInt(dept.GrStt, 10) || 1;
    const desc = dept.Dpt_Desc || dept.desc || "No Description";
    const name = dept.Dpt_Name || dept.name;

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

  // Vendor keyboard handlers
  const handleVendorKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsVendorDropdownOpen(true);
      setVendorSearchTerm("");
      setVendorHighlightedIndex(-1);
      setTimeout(() => vendorSearchRef.current?.focus(), 0);
    }
  };

  const handleVendorSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredVendors.length > 0) {
        setVendorHighlightedIndex(0);
        setTimeout(() => {
          if (vendorItemRefs.current[0]) {
            vendorItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsVendorDropdownOpen(false);
      setVendorHighlightedIndex(-1);
      setVendorSearchTerm("");
      vendorButtonRef.current?.focus();
    }
  };

  const handleVendorItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredVendors.length) {
        setVendorHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (vendorItemRefs.current[nextIndex]) {
            vendorItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setVendorHighlightedIndex(-1);
        setTimeout(() => vendorSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setVendorHighlightedIndex(-1);
        setTimeout(() => vendorSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setVendorHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (vendorItemRefs.current[prevIndex]) {
            vendorItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleVendorSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsVendorDropdownOpen(false);
      setVendorHighlightedIndex(-1);
      setVendorSearchTerm("");
      vendorButtonRef.current?.focus();
    }
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor.id.toString());
    setIsVendorDropdownOpen(false);
    setVendorSearchTerm("");
    setVendorHighlightedIndex(-1);
    if (hasGenerated) invalidateReport();
  };

  const getSelectedVendorDisplay = () => {
    if (!selectedVendor) return "";
    const selected = vendors.find((v) => v.id.toString() == selectedVendor);
    return selected ? selected.name : "";
  };

  const renderVendorItem = (vendor) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{vendor.name}</div>
      {vendor.subText && (
        <div className="text-xs text-gray-500 mt-1">{vendor.subText}</div>
      )}
    </div>
  );

  const handleGenerateReport = async () => {
    // Create filters object first
    const filters = {
      dept_id: selectedDepartment,
      vendor_id: selectedVendor || null,
      from_date: fromDate || null,
      to_date: toDate || null,
    };

    // Update state
    setAppliedFilters(filters);
    setHasGenerated(true);

    // Make API call with the filters directly
    await fetchWorkOrdersDataWithFilters(1, filters);
  };

  // Create a new function that accepts filters as parameter
  const fetchWorkOrdersDataWithFilters = async (page = 1, filters) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        per_page: 15,
      };

      // Use the passed filters instead of appliedFilters state
      if (filters?.dept_id && filters.dept_id != "all") {
        params.dept_id = filters.dept_id;
      }
      if (filters?.vendor_id) params.vendor_id = filters.vendor_id;
      if (filters?.from_date) params.from_date = filters.from_date;
      if (filters?.to_date) params.to_date = filters.to_date;

      const url = `${import.meta.env.VITE_API_URL}/tender-reports/departmentwise-work-orders`;
      const response = await axios.get(url, { params,
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
       });

      if (response.data?.success) {
        setReportData(response.data);

        // Flatten the data to create a simple table with all work orders
        const flattenedData = [];
        (response.data.data || []).forEach((dept) => {
          (dept.work_orders || []).forEach((wo) => {
            flattenedData.push({
              id: wo.work_order_id,
              departmentName: dept.department_name || "-",
              workOrderNo: wo.work_order_no || "-",
              workOrderDate: wo.formatted_work_order_date || "-",
              vendorId: wo.vendor_id,
              vendorName: wo.vendor_name || "-",
              workOrderAmount: wo.work_order_amount || 0,
              formattedWorkOrderAmount:
                wo.formatted_work_order_amount ||
                formatAmount(wo.work_order_amount || 0),
              billedAmount: wo.billed_amount || 0,
              formattedBilledAmount:
                wo.formatted_billed_amount ||
                formatAmount(wo.billed_amount || 0),
              balanceAmount: wo.balance_amount || 0,
              formattedBalanceAmount:
                wo.formatted_balance_amount ||
                formatAmount(wo.balance_amount || 0),
              status: wo.work_order_status || wo.status_code || "-",
              statusCode: wo.status_code || wo.work_order_status || "",
              description: wo.description || "-",
              completionPercentage: wo.completion_percentage || 0,
            });
          });
        });

        setEntries(flattenedData);
        setSummary(response.data?.summary || null);
        setPagination(response.data?.pagination || null);

        setMessage({
          text: response.data.message || "Data loaded successfully",
          type: "success",
        });
      } else {
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
        setEntries([]);
        setSummary(null);
        setPagination(null);
      }
    } catch (err) {
      console.error("Error fetching Work Orders data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading Work Orders data",
        type: "error",
      });
      setEntries([]);
      setSummary(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // Update the existing fetchWorkOrdersData function to use the new one with current appliedFilters
  const fetchWorkOrdersData = async (page = 1) => {
    if (appliedFilters) {
      await fetchWorkOrdersDataWithFilters(page, appliedFilters);
    } else {
      // If no appliedFilters, create default filters
      const defaultFilters = {
        dept_id: selectedDepartment,
        vendor_id: selectedVendor || null,
        from_date: fromDate || null,
        to_date: toDate || null,
      };
      await fetchWorkOrdersDataWithFilters(page, defaultFilters);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (pagination?.last_page || 1)) {
      fetchWorkOrdersData(page);
    }
  };

  // Filter entries based on search term
  const getFilteredEntries = () => {
    if (!searchTerm.trim()) return entries;

    const searchLower = searchTerm.toLowerCase();
    return entries.filter(
      (entry) =>
        (entry.departmentName &&
          entry.departmentName.toLowerCase().includes(searchLower)) ||
        (entry.workOrderNo &&
          entry.workOrderNo.toLowerCase().includes(searchLower)) ||
        (entry.vendorName &&
          entry.vendorName.toLowerCase().includes(searchLower)) ||
        (entry.status && entry.status.toLowerCase().includes(searchLower)),
    );
  };

  // Format amount
  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || isNaN(amount)) return "₹ 0.00";

    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return "₹ 0.00";
      return `₹ ${num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } catch (error) {
      return "₹ 0.00";
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const statusLower = status.toLowerCase();
    if (statusLower == "active") return "bg-green-100 text-green-800";
    if (statusLower == "completed") return "bg-blue-100 text-blue-800";
    if (statusLower == "on_hold") return "bg-yellow-100 text-yellow-800";
    if (statusLower == "cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // =============  EXCEL EXPORT FUNCTIONALITY ==============
  const exportToExcel = async () => {
    if (!hasData) {
      setMessage({
        text: "No data to export. Please generate report first.",
        type: "warning",
      });
      return;
    }

    setExportingExcel(true);

    try {
      const filteredEntries = getFilteredEntries();

      // Prepare data for Excel
      const excelData = filteredEntries.map((entry) => ({
        "Department Name": entry.departmentName || "-",
        "Work Order No": entry.workOrderNo || "-",
        "Work Order Date": entry.workOrderDate || "-",
        "Vendor Name": entry.vendorName || "-",
        "Work Order Amount": entry.workOrderAmount
          ? parseFloat(entry.workOrderAmount).toFixed(2)
          : "0.00",
        "Billed Amount": entry.billedAmount
          ? parseFloat(entry.billedAmount).toFixed(2)
          : "0.00",
        "Balance Amount": entry.balanceAmount
          ? parseFloat(entry.balanceAmount).toFixed(2)
          : "0.00",
        Status: entry.status || "-",
        Description: entry.description || "-",
      }));

      // Add summary row
      if (summary) {
        excelData.push({});
        excelData.push({
          "Department Name": "SUMMARY",
          "Work Order No": "",
          "Work Order Date": "",
          "Vendor Name": "",
          "Work Order Amount": summary.total_work_order_amount
            ? parseFloat(summary.total_work_order_amount).toFixed(2)
            : "0.00",
          "Billed Amount": summary.total_billed_amount
            ? parseFloat(summary.total_billed_amount).toFixed(2)
            : "0.00",
          "Balance Amount": summary.total_balance_amount
            ? parseFloat(summary.total_balance_amount).toFixed(2)
            : "0.00",
          Status: `Total Work Orders: ${summary.total_work_orders || 0}`,
          Description: "",
        });
        if (summary.overall_completion_percentage) {
          excelData.push({
            "Department Name": "Overall Completion",
            "Work Order Amount": `${summary.overall_completion_percentage}%`,
            Status: "",
          });
        }
      }

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const maxWidth = 50;
      const colWidths = {};
      excelData.forEach((row) => {
        Object.keys(row).forEach((key) => {
          const value = row[key]?.toString() || "";
          const width = Math.min(value.length, maxWidth);
          if (!colWidths[key] || width > colWidths[key]) {
            colWidths[key] = width;
          }
        });
      });

      worksheet["!cols"] = Object.keys(excelData[0] || {}).map((key) => ({
        wch: Math.max(colWidths[key] || 10, 15),
      }));

      // Style the worksheet
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellAddress]) continue;

          // Make header row bold (row 0)
          if (row == 0) {
            worksheet[cellAddress].s = {
              font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "4F81BD" }, patternType: "solid" },
            };
          }

          // Highlight summary rows
          if (
            excelData[row] &&
            excelData[row]["Department Name"] == "SUMMARY"
          ) {
            worksheet[cellAddress].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "FFFF00" }, patternType: "solid" },
            };
          }
        }
      }

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Departmentwise Work Orders",
      );

      // Generate filename with date
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const fileName = `${pageTitle}_${timestamp}.xlsx`;

      // Export file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);

      setMessage({
        text: "Excel file exported successfully!",
        type: "success",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        if (message.type == "success") {
          setMessage({ text: "", type: "" });
        }
      }, 3000);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setMessage({
        text: "Error exporting data to Excel",
        type: "error",
      });
    } finally {
      setExportingExcel(false);
    }
  };

  // Print Report Content
  const PrintReportContent = () => {
    const filteredEntries = getFilteredEntries();

    const styles = {
      page: {
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        fontSize: "12px",
        position: "relative",
      },
      header: {
        textAlign: "center",
        marginBottom: "20px",
        borderBottom: "2px solid #333",
        paddingBottom: "10px",
      },
      title: {
        fontSize: "18px",
        fontWeight: "bold",
        margin: "5px 0",
      },
      subTitle: {
        fontSize: "12px",
        color: "#666",
        marginTop: "5px",
      },
      filterInfo: {
        marginTop: "10px",
        padding: "10px",
        backgroundColor: "#f9fafb",
        borderRadius: "4px",
        fontSize: "10px",
      },
      tableContainer: {
        width: "100%",
        overflowX: "auto",
        position: "relative",
        marginTop: "15px",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "10px",
      },
      th: {
        backgroundColor: "#ecfdf5",
        fontWeight: "600",
        padding: "8px",
        border: "1px solid #d1fae5",
        textAlign: "center",
        color: "#047857",
      },
      thLeft: {
        backgroundColor: "#ecfdf5",
        fontWeight: "600",
        padding: "8px",
        border: "1px solid #d1fae5",
        textAlign: "left",
        color: "#047857",
      },
      thRight: {
        backgroundColor: "#ecfdf5",
        fontWeight: "600",
        padding: "8px",
        border: "1px solid #d1fae5",
        textAlign: "right",
        color: "#047857",
      },
      td: {
        padding: "6px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      tdLeft: {
        padding: "6px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
        textAlign: "left",
      },
      tdRight: {
        padding: "6px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
        textAlign: "right",
      },
      summary: {
        marginTop: "20px",
        padding: "10px",
        backgroundColor: "#fdf2f8",
        borderRadius: "4px",
      },
      summaryRow: {
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 0",
      },
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <div style={styles.subTitle}>
            Generated Date:{" "}
            {reportData?.report_date || new Date().toLocaleString()}
          </div>
          {appliedFilters && Object.values(appliedFilters).some((v) => v) && (
            <div style={styles.filterInfo}>
              <strong>Filters Applied:</strong>
              {appliedFilters.dept_id &&
                appliedFilters.dept_id != "all" &&
                ` Department: ${getSelectedDeptDisplay()}`}
              {appliedFilters.dept_id == "all" &&
                ` Department: All Departments`}
              {appliedFilters.vendor_id &&
                ` Vendor: ${vendors.find((v) => v.id.toString() == appliedFilters.vendor_id)?.name || appliedFilters.vendor_id}`}
              {appliedFilters.from_date &&
                ` From Date: ${appliedFilters.from_date}`}
              {appliedFilters.to_date && ` To Date: ${appliedFilters.to_date}`}
            </div>
          )}
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thLeft}>Department Name</th>
                <th style={styles.thLeft}>Work Order No</th>
                <th style={styles.thLeft}>Date</th>
                <th style={styles.thLeft}>Vendor Name</th>
                <th style={styles.thRight}>Work Order Amount</th>
                <th style={styles.thRight}>Billed Amount</th>
                <th style={styles.thRight}>Balance Amount</th>
                <th style={styles.thLeft}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => (
                <tr key={entry.id || index}>
                  <td style={styles.tdLeft}>{entry.departmentName || "-"}</td>
                  <td style={styles.tdLeft}>{entry.workOrderNo || "-"}</td>
                  <td style={styles.tdLeft}>{entry.workOrderDate || "-"}</td>
                  <td style={styles.tdLeft}>{entry.vendorName || "-"}</td>
                  <td style={styles.tdRight}>
                    {entry.formattedWorkOrderAmount ||
                      formatAmount(entry.workOrderAmount)}
                  </td>
                  <td style={styles.tdRight}>
                    {entry.formattedBilledAmount ||
                      formatAmount(entry.billedAmount)}
                  </td>
                  <td style={styles.tdRight}>
                    {entry.formattedBalanceAmount ||
                      formatAmount(entry.balanceAmount)}
                  </td>
                  <td style={styles.tdLeft}>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        backgroundColor:
                          entry.statusCode == "active"
                            ? "#d1fae5"
                            : entry.statusCode == "completed"
                              ? "#FFCDD2"
                              : entry.statusCode == "on_hold"
                                ? "#fef3c7"
                                : entry.statusCode == "cancelled"
                                  ? "#fee2e2"
                                  : "#f3f4f6",
                        color:
                          entry.statusCode == "active"
                            ? "#065f46"
                            : entry.statusCode == "completed"
                              ? "#B71C1C"
                              : entry.statusCode == "on_hold"
                                ? "#92400e"
                                : entry.statusCode == "cancelled"
                                  ? "#991b1b"
                                  : "#1f2937",
                      }}
                    >
                      {entry.status || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {summary && (
          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <strong>Total Work Orders:</strong>
              <span>{summary.total_work_orders || 0}</span>
            </div>
            <div style={styles.summaryRow}>
              <strong>Total Work Order Amount:</strong>
              <span>
                {summary.formatted_total_work_order_amount ||
                  formatAmount(summary.total_work_order_amount)}
              </span>
            </div>
            <div style={styles.summaryRow}>
              <strong>Total Billed Amount:</strong>
              <span>
                {summary.formatted_total_billed_amount ||
                  formatAmount(summary.total_billed_amount)}
              </span>
            </div>
            <div style={styles.summaryRow}>
              <strong>Total Balance Amount:</strong>
              <span>
                {summary.formatted_total_balance_amount ||
                  formatAmount(summary.total_balance_amount)}
              </span>
            </div>
            <div style={styles.summaryRow}>
              <strong>Overall Completion:</strong>
              <span>{summary.overall_completion_percentage || 0}%</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render filters section
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Department Dropdown */}
          <div className="flex-1">
            <SearchableDropdown
              label="Department"
              value={selectedDepartment}
              error={null}
              required={true}
              icon={FiFileText}
              isOpen={isDeptDropdownOpen}
              setIsOpen={setIsDeptDropdownOpen}
              searchTerm={deptSearchTerm}
              setSearchTerm={setDeptSearchTerm}
              items={flattenedDepartments}
              filteredItems={filteredDepartments}
              highlightedIndex={deptHighlightedIndex}
              onSelect={handleDeptSelect}
              onKeyDown={handleDeptKeyDown}
              onSearchKeyDown={handleDeptSearchKeyDown}
              onItemKeyDown={handleDeptItemKeyDown}
              getSelectedDisplay={getSelectedDeptDisplay}
              loading={loadingDropdowns}
              placeholder="Select Department"
              searchPlaceholder="Search by department name, description..."
              buttonRef={deptButtonRef}
              dropdownRef={deptDropdownRef}
              searchRef={deptSearchRef}
              itemRefs={deptItemRefs}
              listRef={deptListRef}
              renderItem={renderDepartmentItem}
              includeAllOption={true}
              allOptionLabel="All Departments"
              allOptionValue="all"
            />
          </div>

          {/* Vendor Dropdown */}
          <div className="flex-1">
            <SearchableDropdown
              label="Vendor (Optional)"
              value={selectedVendor}
              error={null}
              required={false}
              icon={FiTag}
              isOpen={isVendorDropdownOpen}
              setIsOpen={setIsVendorDropdownOpen}
              searchTerm={vendorSearchTerm}
              setSearchTerm={setVendorSearchTerm}
              items={vendors}
              filteredItems={filteredVendors}
              highlightedIndex={vendorHighlightedIndex}
              onSelect={handleVendorSelect}
              onKeyDown={handleVendorKeyDown}
              onSearchKeyDown={handleVendorSearchKeyDown}
              onItemKeyDown={handleVendorItemKeyDown}
              getSelectedDisplay={getSelectedVendorDisplay}
              loading={loadingDropdowns}
              placeholder="All Vendors"
              searchPlaceholder="Search by vendor name or code..."
              buttonRef={vendorButtonRef}
              dropdownRef={vendorDropdownRef}
              searchRef={vendorSearchRef}
              itemRefs={vendorItemRefs}
              listRef={vendorListRef}
              renderItem={renderVendorItem}
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                name="from_date"
                value={fromDate}
                onChange={handleDateChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                name="to_date"
                value={toDate}
                onChange={handleDateChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading || loadingDropdowns}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <FiCheck className="h-4 w-4 mr-2" />
              Generate Report
            </button>

            {(hasGenerated || appliedFilters) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
              >
                <FiX className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Search Box for table results */}
          {hasGenerated && entries.length > 0 && (
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search in results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500">Loading Work Orders data...</p>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-gray-500">{message.text}</p>
    </div>
  );

  // Render no data state
  const renderNoData = () =>
    !hasGenerated ? (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Generate report to view results
        </h3>
        <p className="text-gray-600 mb-4">
          Select filters and click{" "}
          <span className="font-medium">Generate Report</span>.
        </p>
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Work Orders Found
        </h3>
        <p className="text-gray-600 mb-4">
          No work orders available for the selected filters.
        </p>
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center transition-colors"
        >
          <FiX className="h-4 w-4 mr-2" />
          Clear Filters
        </button>
      </div>
    );

  // Render data table
  const renderDataTable = () => {
    const filteredEntries = getFilteredEntries();

    return (
      <div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-emerald-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Department Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Work Order No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Vendor Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Work Order Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Billed Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Balance Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry, idx) => (
                <tr
                  key={entry.id || idx}
                  className={`${idx % 2 == 0 ? "bg-white" : "bg-gray-50"} hover:bg-sky-50 transition-colors`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {entry.departmentName || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                    {entry.workOrderNo || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {entry.workOrderDate || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {entry.vendorName || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                    {entry.formattedWorkOrderAmount ||
                      formatAmount(entry.workOrderAmount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                    {entry.formattedBilledAmount ||
                      formatAmount(entry.billedAmount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                    {entry.formattedBalanceAmount ||
                      formatAmount(entry.balanceAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(entry.status)}`}
                    >
                      {entry.status || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {summary && hasGenerated && (
              <tfoot className="bg-pink-50">
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-3 text-sm font-semibold text-rose-700 text-right"
                  ></td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                    {summary.formatted_total_work_order_amount ||
                      formatAmount(summary.total_work_order_amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                    {summary.formatted_total_billed_amount ||
                      formatAmount(summary.total_billed_amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                    {summary.formatted_total_balance_amount ||
                      formatAmount(summary.total_balance_amount)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-rose-700">
                    Completion: {summary.overall_completion_percentage || 0}%
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {hasGenerated && filteredEntries.length == 0 && searchTerm && (
          <div className="text-center py-4 text-gray-500">
            No matching records found for "{searchTerm}"
          </div>
        )}
      </div>
    );
  };

  const hasData = entries.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title={`${pageTitle}`}
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="px-2 py-6 max-w-full">
        {/* Header with back button and export buttons */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>

          <div className="flex space-x-2">
            {/* Excel Export Button */}
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!hasData || loading || exportingExcel}
              title="Export to Excel"
            >
              {exportingExcel ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <FiDownload className="h-4 w-4 mr-2" />
                  Export Excel
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
              title="Print Report"
            >
              <FiPrinter className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          {/* Header with dynamic title */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {pageTitle}
            </h2>
          </div>

          {/* Filters */}
          {renderFilters()}

          {/* Loading State */}
          {loading && renderLoading()}

          {/* Error State */}
          {!loading && message.type == "error" && renderError()}

          {/* Warning/Info Message */}
          {!loading && message.type == "warning" && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">{message.text}</p>
            </div>
          )}

          {/* No Data State */}
          {!loading &&
            !hasData &&
            message.type != "error" &&
            message.type != "warning" &&
            renderNoData()}

          {/* Data Display */}
          {!loading && hasData && renderDataTable()}

          {/* Pagination */}
          {!loading && hasData && pagination && pagination.last_page > 1 && (
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentwiseActiveWorkOrders;
