// src/pages/reports/tender-management/departmentwise-bg-register.jsx

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
  FiHash,
  FiUsers,
  FiFileText,
  FiFolder,
  FiChevronRight,
  FiDownload,
} from "react-icons/fi";
import axios from "axios";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";
import * as XLSX from "xlsx";

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
            {filteredItems && filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const itemId =
                  item.id ||
                  item.TE_Id ||
                  item.SL_Id ||
                  item.WA_Id ||
                  item.Dpt_id ||
                  `item-${idx}`;

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

// =============  HIERARCHICAL DEPARTMENT DROPDOWN ==============
const HierarchicalDepartmentDropdown = ({
  label,
  value,
  error,
  required = false,
  icon: Icon,
  isOpen,
  setIsOpen,
  searchTerm,
  setSearchTerm,
  departments,
  filteredDepartments,
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
}) => {
  const handleWheel = (e) => {
    e.stopPropagation();
  };

  const handleSearchChange = (e) => {
    if (typeof setSearchTerm == "function") {
      setSearchTerm(e.target.value);
    }
  };

  // Build hierarchical display
  const getLevelDisplay = (dept) => {
    const level = dept.GrCod ? dept.GrCod.replace(/0+$/, "").length / 2 : 0;
    return level;
  };

  const renderDepartmentItem = (dept) => {
    const level = getLevelDisplay(dept);
    const indentClass = level > 0 ? `pl-${level * 4}` : "";

    return (
      <div className={`py-1 ${indentClass}`}>
        <div className="flex items-center">
          {level > 0 && (
            <FiChevronRight className="h-3 w-3 text-gray-400 mr-1" />
          )}
          <div>
            <div className="font-medium text-gray-900">{dept.Dpt_Desc}</div>
            <div className="text-xs text-gray-500">{dept.Dpt_Name}</div>
          </div>
        </div>
      </div>
    );
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
            {filteredDepartments && filteredDepartments.length > 0 ? (
              filteredDepartments.map((dept, idx) => {
                const deptId = dept.Dpt_id;

                return (
                  <button
                    key={deptId}
                    ref={(el) => {
                      if (el && itemRefs.current) {
                        itemRefs.current[idx] = el;
                      }
                    }}
                    type="button"
                    onClick={() => onSelect(dept)}
                    onKeyDown={(e) => onItemKeyDown(e, dept, idx)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                      highlightedIndex == idx
                        ? "bg-blue-100"
                        : value && deptId && value == deptId.toString()
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                    }`}
                    tabIndex={0}
                  >
                    {renderDepartmentItem(dept)}
                    {value && deptId && value == deptId.toString() && (
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
                <p>No departments found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredDepartments?.length || 0} departments found</span>
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

const DepartmentwiseBGRegister = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState(null);
  const [departmentWiseData, setDepartmentWiseData] = useState([]);
  const [grandSummary, setGrandSummary] = useState(null);
  const [pageTitle, setPageTitle] = useState("Departmentwise BG Register");

  // Dropdown data states
  const [departments, setDepartments] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [workAllocations, setWorkAllocations] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    from_date: "",
    to_date: "",
    status: "",
    tender_id: "",
    vendor_id: "",
    department_id: "",
    work_allocation_id: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Search state for table
  const [searchTerm, setSearchTerm] = useState("");

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  // Expanded departments state
  const [expandedDepartments, setExpandedDepartments] = useState({});

  // Department dropdown states
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);
  const deptDropdownRef = useRef(null);
  const deptSearchRef = useRef(null);
  const deptItemRefs = useRef([]);
  const deptListRef = useRef(null);
  const deptButtonRef = useRef(null);

  // Tender dropdown states
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [tenderSearchTerm, setTenderSearchTerm] = useState("");
  const [isTenderDropdownOpen, setIsTenderDropdownOpen] = useState(false);
  const [tenderHighlightedIndex, setTenderHighlightedIndex] = useState(-1);
  const tenderDropdownRef = useRef(null);
  const tenderSearchRef = useRef(null);
  const tenderItemRefs = useRef([]);
  const tenderListRef = useRef(null);
  const tenderButtonRef = useRef(null);

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

  // Work Allocation dropdown states
  const [filteredWorkAllocations, setFilteredWorkAllocations] = useState([]);
  const [workAllocSearchTerm, setWorkAllocSearchTerm] = useState("");
  const [isWorkAllocDropdownOpen, setIsWorkAllocDropdownOpen] = useState(false);
  const [workAllocHighlightedIndex, setWorkAllocHighlightedIndex] =
    useState(-1);
  const workAllocDropdownRef = useRef(null);
  const workAllocSearchRef = useRef(null);
  const workAllocItemRefs = useRef([]);
  const workAllocListRef = useRef(null);
  const workAllocButtonRef = useRef(null);

  const { organization } = useOrganization();

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/tender-management/departmentwise-bg-register";

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
        tenderDropdownRef.current &&
        !tenderDropdownRef.current.contains(event.target)
      ) {
        setIsTenderDropdownOpen(false);
        setTenderHighlightedIndex(-1);
        setTenderSearchTerm("");
      }
      if (
        vendorDropdownRef.current &&
        !vendorDropdownRef.current.contains(event.target)
      ) {
        setIsVendorDropdownOpen(false);
        setVendorHighlightedIndex(-1);
        setVendorSearchTerm("");
      }
      if (
        workAllocDropdownRef.current &&
        !workAllocDropdownRef.current.contains(event.target)
      ) {
        setIsWorkAllocDropdownOpen(false);
        setWorkAllocHighlightedIndex(-1);
        setWorkAllocSearchTerm("");
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
    if (isTenderDropdownOpen && tenderSearchRef.current) {
      setTimeout(() => tenderSearchRef.current.focus(), 0);
    }
  }, [isTenderDropdownOpen]);

  useEffect(() => {
    if (isVendorDropdownOpen && vendorSearchRef.current) {
      setTimeout(() => vendorSearchRef.current.focus(), 0);
    }
  }, [isVendorDropdownOpen]);

  useEffect(() => {
    if (isWorkAllocDropdownOpen && workAllocSearchRef.current) {
      setTimeout(() => workAllocSearchRef.current.focus(), 0);
    }
  }, [isWorkAllocDropdownOpen]);

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
      tenderListRef,
      tenderItemRefs,
      tenderHighlightedIndex,
      isTenderDropdownOpen,
    );
  }, [tenderHighlightedIndex, isTenderDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      vendorListRef,
      vendorItemRefs,
      vendorHighlightedIndex,
      isVendorDropdownOpen,
    );
  }, [vendorHighlightedIndex, isVendorDropdownOpen]);

  useEffect(() => {
    scrollIntoView(
      workAllocListRef,
      workAllocItemRefs,
      workAllocHighlightedIndex,
      isWorkAllocDropdownOpen,
    );
  }, [workAllocHighlightedIndex, isWorkAllocDropdownOpen]);

  // Filter departments
  useEffect(() => {
    if (!deptSearchTerm.trim()) {
      setFilteredDepartments(departments);
    } else {
      const term = deptSearchTerm.toLowerCase();
      const filtered = departments.filter(
        (dept) =>
          dept.Dpt_Desc?.toLowerCase().includes(term) ||
          dept.Dpt_Name?.toLowerCase().includes(term),
      );
      setFilteredDepartments(filtered);
    }
    setDeptHighlightedIndex(-1);
  }, [deptSearchTerm, departments]);

  // Filter tenders
  useEffect(() => {
    if (!tenderSearchTerm.trim()) {
      setFilteredTenders(tenders);
    } else {
      const term = tenderSearchTerm.toLowerCase();
      const filtered = tenders.filter(
        (tender) =>
          tender.name?.toLowerCase().includes(term) ||
          tender.searchText?.toLowerCase().includes(term),
      );
      setFilteredTenders(filtered);
    }
    setTenderHighlightedIndex(-1);
  }, [tenderSearchTerm, tenders]);

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

  // Filter work allocations
  useEffect(() => {
    if (!workAllocSearchTerm.trim()) {
      setFilteredWorkAllocations(workAllocations);
    } else {
      const term = workAllocSearchTerm.toLowerCase();
      const filtered = workAllocations.filter(
        (work) =>
          work.name?.toLowerCase().includes(term) ||
          work.searchText?.toLowerCase().includes(term),
      );
      setFilteredWorkAllocations(filtered);
    }
    setWorkAllocHighlightedIndex(-1);
  }, [workAllocSearchTerm, workAllocations]);

  // Fetch all dropdown data
  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      // Fetch Departments
      const deptResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );
      if (deptResponse.data?.success) {
        const formattedDepartments = deptResponse.data.data.map((dept) => ({
          ...dept,
          searchText: `${dept.Dpt_Desc} ${dept.Dpt_Name}`,
        }));
        setDepartments(formattedDepartments);
        setFilteredDepartments(formattedDepartments);
      }

      // Fetch Tenders
      const tendersResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/tender-entries/all`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );
      if (tendersResponse.data?.success) {
        const formattedTenders = tendersResponse.data.data.map((tender) => ({
          id: tender.TE_Id,
          name: tender.tendertype?.TnT_Name || `Tender #${tender.TE_Id}`,
          searchText: `${tender.tendertype?.TnT_Name || ""} ${tender.Description || ""} ${tender.Approved_Amount || ""}`,
          subText: `Proposal: ₹${parseFloat(tender.Proposal_Amount || 0).toLocaleString("en-IN")} | Approved: ₹${parseFloat(tender.Approved_Amount || 0).toLocaleString("en-IN")}`,
          original: tender,
        }));
        setTenders(formattedTenders);
        setFilteredTenders(formattedTenders);
      }

      // Fetch Vendors (Sub-ledgers)
      const vendorsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/sub-ledgers/all`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );
      if (vendorsResponse.data?.success) {
        const formattedVendors = vendorsResponse.data.data.map((vendor) => ({
          id: vendor.SL_Id,
          name: vendor.SL_Name,
          searchText: vendor.SL_Name,
          subText: `${vendor.SL_City || ""} | ${vendor.SL_Phone || ""}`,
          original: vendor,
        }));
        setVendors(formattedVendors);
        setFilteredVendors(formattedVendors);
      }

      // Fetch Work Allocations
      const workAllocResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/work-allocations/all`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );
      if (workAllocResponse.data?.success) {
        const formattedWorkAllocs = workAllocResponse.data.data.map((work) => ({
          id: work.WA_Id,
          name: `WO-${work.WA_Id}`,
          searchText: `${work.WO_Amount} ${work.subledger?.SL_Name || ""}`,
          subText: `${work.subledger?.SL_Name || "Vendor"} | Amount: ₹${parseFloat(work.WO_Amount || 0).toLocaleString("en-IN")}`,
          original: work,
        }));
        setWorkAllocations(formattedWorkAllocs);
        setFilteredWorkAllocations(formattedWorkAllocs);
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

  // Main function to fetch data with filters
  const fetchDepartmentwiseBGRegisterDataWithFilters = async (
    filtersToApply,
  ) => {
    setLoading(true);
    try {
      // Build params object - only include non-empty values
      const params = {};

      if (filtersToApply?.from_date && filtersToApply.from_date.trim()) {
        params.from_date = filtersToApply.from_date;
      }
      if (filtersToApply?.to_date && filtersToApply.to_date.trim()) {
        params.to_date = filtersToApply.to_date;
      }
      if (filtersToApply?.status && filtersToApply.status.trim()) {
        params.status = filtersToApply.status;
      }
      if (filtersToApply?.tender_id && filtersToApply.tender_id.trim()) {
        params.tender_id = filtersToApply.tender_id;
      }
      if (filtersToApply?.vendor_id && filtersToApply.vendor_id.trim()) {
        params.vendor_id = filtersToApply.vendor_id;
      }
      if (
        filtersToApply?.department_id &&
        filtersToApply.department_id.trim()
      ) {
        params.department_id = filtersToApply.department_id;
      }
      if (
        filtersToApply?.work_allocation_id &&
        filtersToApply.work_allocation_id.trim()
      ) {
        params.work_allocation_id = filtersToApply.work_allocation_id;
      }

      console.log("Sending API request with params:", params);

      const url = `${import.meta.env.VITE_API_URL}/departmentwise-bg-register`;
      const response = await axios.get(url, { params ,
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        
      });

      console.log("API Response:", response.data);

      if (response.data?.success) {
        setReportData(response.data.data);

        // Process department wise data to ensure consistent structure
        const processedDeptData = (
          response.data.data?.department_wise_data || []
        ).map((dept) => ({
          department: dept.department,
          summary: dept.summary,
          entries: (dept.entries || []).map((entry) => ({
            ...entry,
            // Ensure all fields have proper values
            work_order_no: entry.work_order_no || "-",
            work_order_date: entry.work_order_date || null,
            order_amount: entry.order_amount || "0",
            bg_amount: entry.bg_amount || "0",
            bg_date: entry.bg_date || null,
            maturity_date: entry.maturity_date || null,
            status_display:
              entry.status_display || getStatusDisplay(entry.status),
            account_budget_head_name: entry.account_budget_head?.name || "-",
          })),
        }));

        setDepartmentWiseData(processedDeptData);
        setGrandSummary(response.data.data?.grand_summary || null);

        // Initialize expanded state for all departments
        const initialExpanded = {};
        processedDeptData.forEach((_, index) => {
          initialExpanded[index] = true;
        });
        setExpandedDepartments(initialExpanded);

        if (processedDeptData.length == 0) {
          setMessage({
            text: "No data found for the selected filters",
            type: "info",
          });
        } else {
          setMessage({
            text: response.data.message || "Data loaded successfully",
            type: "success",
          });
        }
      } else {
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
        setDepartmentWiseData([]);
        setGrandSummary(null);
      }
    } catch (err) {
      console.error("Error fetching Departmentwise BG Register data:", err);
      setMessage({
        text:
          err.response?.data?.message ||
          "Error loading Departmentwise BG Register data",
        type: "error",
      });
      setDepartmentWiseData([]);
      setGrandSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Departmentwise BG Register data from API with applied filters
  const fetchDepartmentwiseBGRegisterData = async () => {
    await fetchDepartmentwiseBGRegisterDataWithFilters(appliedFilters);
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedFilters(null);
    setDepartmentWiseData([]);
    setGrandSummary(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setFilters({
      from_date: "",
      to_date: "",
      status: "",
      tender_id: "",
      vendor_id: "",
      department_id: "",
      work_allocation_id: "",
    });
    setDeptSearchTerm("");
    setTenderSearchTerm("");
    setVendorSearchTerm("");
    setWorkAllocSearchTerm("");
    setSearchTerm("");
    invalidateReport();
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (hasGenerated) invalidateReport();
  };

  const handleStatusChange = (e) => {
    const { value } = e.target;
    setFilters((prev) => ({ ...prev, status: value }));
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
        handleDeptSelect(filteredDepartments[deptHighlightedIndex]);
      } else if (filteredDepartments.length > 0) {
        handleDeptSelect(filteredDepartments[0]);
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
    setFilters((prev) => ({ ...prev, department_id: dept.Dpt_id.toString() }));
    setIsDeptDropdownOpen(false);
    setDeptSearchTerm("");
    setDeptHighlightedIndex(-1);
    if (hasGenerated) invalidateReport();
  };

  const getSelectedDeptDisplay = () => {
    if (!filters.department_id) return "";
    const selected = departments.find(
      (d) => d.Dpt_id.toString() == filters.department_id,
    );
    return selected ? `${selected.Dpt_Desc} (${selected.Dpt_Name})` : "";
  };

  // Tender keyboard handlers
  const handleTenderKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsTenderDropdownOpen(true);
      setTenderSearchTerm("");
      setTenderHighlightedIndex(-1);
      setTimeout(() => tenderSearchRef.current?.focus(), 0);
    }
  };

  const handleTenderSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredTenders.length > 0) {
        setTenderHighlightedIndex(0);
        setTimeout(() => {
          if (tenderItemRefs.current[0]) {
            tenderItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderDropdownOpen(false);
      setTenderHighlightedIndex(-1);
      setTenderSearchTerm("");
      tenderButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredTenders.length > 0 && tenderHighlightedIndex >= 0) {
        handleTenderSelect(filteredTenders[tenderHighlightedIndex]);
      } else if (filteredTenders.length > 0) {
        handleTenderSelect(filteredTenders[0]);
      }
    }
  };

  const handleTenderItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredTenders.length) {
        setTenderHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (tenderItemRefs.current[nextIndex]) {
            tenderItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setTenderHighlightedIndex(-1);
        setTimeout(() => tenderSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setTenderHighlightedIndex(-1);
        setTimeout(() => tenderSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setTenderHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (tenderItemRefs.current[prevIndex]) {
            tenderItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleTenderSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderDropdownOpen(false);
      setTenderHighlightedIndex(-1);
      setTenderSearchTerm("");
      tenderButtonRef.current?.focus();
    }
  };

  const handleTenderSelect = (tender) => {
    setFilters((prev) => ({ ...prev, tender_id: tender.id.toString() }));
    setIsTenderDropdownOpen(false);
    setTenderSearchTerm("");
    setTenderHighlightedIndex(-1);
    if (hasGenerated) invalidateReport();
  };

  const getSelectedTenderDisplay = () => {
    if (!filters.tender_id) return "";
    const selected = tenders.find((t) => t.id.toString() == filters.tender_id);
    return selected ? selected.name : "";
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
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredVendors.length > 0 && vendorHighlightedIndex >= 0) {
        handleVendorSelect(filteredVendors[vendorHighlightedIndex]);
      } else if (filteredVendors.length > 0) {
        handleVendorSelect(filteredVendors[0]);
      }
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
    setFilters((prev) => ({ ...prev, vendor_id: vendor.id.toString() }));
    setIsVendorDropdownOpen(false);
    setVendorSearchTerm("");
    setVendorHighlightedIndex(-1);
    if (hasGenerated) invalidateReport();
  };

  const getSelectedVendorDisplay = () => {
    if (!filters.vendor_id) return "";
    const selected = vendors.find((v) => v.id.toString() == filters.vendor_id);
    return selected ? selected.name : "";
  };

  // Work Allocation keyboard handlers
  const handleWorkAllocKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsWorkAllocDropdownOpen(true);
      setWorkAllocSearchTerm("");
      setWorkAllocHighlightedIndex(-1);
      setTimeout(() => workAllocSearchRef.current?.focus(), 0);
    }
  };

  const handleWorkAllocSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredWorkAllocations.length > 0) {
        setWorkAllocHighlightedIndex(0);
        setTimeout(() => {
          if (workAllocItemRefs.current[0]) {
            workAllocItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsWorkAllocDropdownOpen(false);
      setWorkAllocHighlightedIndex(-1);
      setWorkAllocSearchTerm("");
      workAllocButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (
        filteredWorkAllocations.length > 0 &&
        workAllocHighlightedIndex >= 0
      ) {
        handleWorkAllocSelect(
          filteredWorkAllocations[workAllocHighlightedIndex],
        );
      } else if (filteredWorkAllocations.length > 0) {
        handleWorkAllocSelect(filteredWorkAllocations[0]);
      }
    }
  };

  const handleWorkAllocItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredWorkAllocations.length) {
        setWorkAllocHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (workAllocItemRefs.current[nextIndex]) {
            workAllocItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setWorkAllocHighlightedIndex(-1);
        setTimeout(() => workAllocSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setWorkAllocHighlightedIndex(-1);
        setTimeout(() => workAllocSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setWorkAllocHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (workAllocItemRefs.current[prevIndex]) {
            workAllocItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleWorkAllocSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsWorkAllocDropdownOpen(false);
      setWorkAllocHighlightedIndex(-1);
      setWorkAllocSearchTerm("");
      workAllocButtonRef.current?.focus();
    }
  };

  const handleWorkAllocSelect = (work) => {
    setFilters((prev) => ({ ...prev, work_allocation_id: work.id.toString() }));
    setIsWorkAllocDropdownOpen(false);
    setWorkAllocSearchTerm("");
    setWorkAllocHighlightedIndex(-1);
    if (hasGenerated) invalidateReport();
  };

  const getSelectedWorkAllocDisplay = () => {
    if (!filters.work_allocation_id) return "";
    const selected = workAllocations.find(
      (w) => w.id.toString() == filters.work_allocation_id,
    );
    return selected ? selected.name : "";
  };

  const handleGenerateReport = async () => {
    // Create a copy of current filters to apply
    const filtersToApply = { ...filters };

    // Remove empty values
    Object.keys(filtersToApply).forEach((key) => {
      if (!filtersToApply[key] || filtersToApply[key].trim() == "") {
        delete filtersToApply[key];
      }
    });

    console.log("Applying filters:", filtersToApply);

    // Set state
    setAppliedFilters(filtersToApply);
    setHasGenerated(true);

    // Fetch data directly with the filters we just created
    await fetchDepartmentwiseBGRegisterDataWithFilters(filtersToApply);
  };

  // Excel Export Function
  const exportToExcel = () => {
    if (!departmentWiseData.length) {
      setMessage({
        text: "No data to export",
        type: "info",
      });
      return;
    }

    try {
      const filteredData = getFilteredEntries();

      // Prepare data for Excel
      const excelData = [];

      // Add header row
      excelData.push([
        "Department",
        "Account / Budget Head",
        "Tender No",
        "Work Order No",
        "Work Order Date",
        "Order Amount (₹)",
        "Vendor Name",
        "BG Date",
        "BG Amount (₹)",
        "Maturity Date",
        "Status",
      ]);

      // Add data rows
      filteredData.forEach((dept) => {
        dept.entries.forEach((entry) => {
          excelData.push([
            dept.department?.name || "-",
            entry.account_budget_head_name || "-",
            entry.tender_no || "-",
            entry.work_order_no != "-" ? entry.work_order_no : "-",
            formatDate(entry.work_order_date),
            entry.order_amount && entry.order_amount != "0"
              ? parseFloat(entry.order_amount).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00",
            entry.vendor_name || "-",
            formatDate(entry.bg_date),
            entry.bg_amount && entry.bg_amount != "0"
              ? parseFloat(entry.bg_amount).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00",
            formatDate(entry.maturity_date),
            entry.status_display || "-",
          ]);
        });

        // Add department summary row
        if (dept.summary && dept.summary.total_department_bg) {
          excelData.push([
            `TOTAL FOR ${dept.department?.name || "Department"}`,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            `₹ ${parseFloat(dept.summary.total_department_bg).toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}`,
            "",
            "",
          ]);
          excelData.push([""]); // Empty row for separation
        }
      });

      // Add grand summary if available
      if (grandSummary) {
        excelData.push([
          "GRAND SUMMARY",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
        excelData.push([
          "Total Departments",
          grandSummary.total_departments?.toString() || "0",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
        excelData.push([
          "Total Entries",
          grandSummary.total_entries?.toString() || "0",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
        excelData.push([
          "Total BG Amount",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          `₹ ${parseFloat(grandSummary.total_bg_amount || 0).toLocaleString(
            "en-IN",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          )}`,
          "",
          "",
        ]);
      }

      // Add filter information
      if (appliedFilters && Object.keys(appliedFilters).length > 0) {
        excelData.push([""]);
        excelData.push([
          "FILTERS APPLIED",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]);
        if (appliedFilters.from_date)
          excelData.push(["From Date", appliedFilters.from_date]);
        if (appliedFilters.to_date)
          excelData.push(["To Date", appliedFilters.to_date]);
        if (appliedFilters.status)
          excelData.push(["Status", appliedFilters.status]);
        if (appliedFilters.department_id)
          excelData.push(["Department", getSelectedDeptDisplay()]);
        if (appliedFilters.tender_id)
          excelData.push(["Tender", getSelectedTenderDisplay()]);
        if (appliedFilters.vendor_id)
          excelData.push(["Vendor", getSelectedVendorDisplay()]);
        if (appliedFilters.work_allocation_id)
          excelData.push(["Work Allocation", getSelectedWorkAllocDisplay()]);
      }

      // Add generation info
      excelData.push([""]);
      excelData.push(["Report Generated On", new Date().toLocaleString()]);

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Set column widths
      ws["!cols"] = [
        { wch: 25 }, // Department
        { wch: 30 }, // Account/Budget Head
        { wch: 15 }, // Tender No
        { wch: 15 }, // Work Order No
        { wch: 15 }, // Work Order Date
        { wch: 15 }, // Order Amount
        { wch: 25 }, // Vendor Name
        { wch: 12 }, // BG Date
        { wch: 15 }, // BG Amount
        { wch: 12 }, // Maturity Date
        { wch: 12 }, // Status
      ];

      // Style the header row
      const headerRange = XLSX.utils.decode_range(ws["!ref"]);
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[address]) continue;
        ws[address].s = {
          font: { bold: true, sz: 12 },
          fill: { fgColor: { rgb: "4F81BD" } },
          alignment: { horizontal: "center" },
        };
      }

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Departmentwise BG Register");

      // Generate filename
      const filename = `${pageTitle.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      setMessage({
        text: "Excel exported successfully!",
        type: "success",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage((prev) =>
          prev.type == "success" ? { text: "", type: "" } : prev,
        );
      }, 3000);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setMessage({
        text: "Error exporting to Excel",
        type: "error",
      });
    }
  };

  const toggleDepartment = (index) => {
    setExpandedDepartments((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Filter entries based on search term across all departments
  const getFilteredEntries = () => {
    if (!searchTerm.trim()) return departmentWiseData;

    const searchLower = searchTerm.toLowerCase();
    return departmentWiseData
      .map((dept) => ({
        ...dept,
        entries: dept.entries.filter(
          (entry) =>
            (entry.account_budget_head_name &&
              entry.account_budget_head_name
                .toLowerCase()
                .includes(searchLower)) ||
            (entry.tender_no &&
              entry.tender_no.toLowerCase().includes(searchLower)) ||
            (entry.work_order_no &&
              entry.work_order_no != "-" &&
              entry.work_order_no.toLowerCase().includes(searchLower)) ||
            (entry.vendor_name &&
              entry.vendor_name.toLowerCase().includes(searchLower)) ||
            (entry.status_display &&
              entry.status_display.toLowerCase().includes(searchLower)),
        ),
      }))
      .filter((dept) => dept.entries.length > 0);
  };

  // Format amount
  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || amount == "0" || amount == 0)
      return "₹ 0.00";

    try {
      // Remove any existing commas and convert to number
      let num;
      if (typeof amount == "string") {
        num = parseFloat(amount.replace(/,/g, ""));
      } else {
        num = parseFloat(amount);
      }
      if (isNaN(num)) return "₹ 0.00";
      return `₹ ${num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } catch (error) {
      return "₹ 0.00";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      // Handle different date formats
      let date;
      if (typeof dateString == "string" && dateString.includes("T")) {
        date = new Date(dateString);
      } else if (typeof dateString == "string") {
        // Try to parse YYYY-MM-DD format
        const parts = dateString.split("-");
        if (parts.length == 3) {
          date = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const statusLower = status.toLowerCase();
    if (
      statusLower == "active" ||
      statusLower == "valid" ||
      statusLower == "hod_app"
    )
      return "bg-green-100 text-green-800";
    if (statusLower == "expired" || statusLower == "closed")
      return "bg-red-100 text-red-800";
    if (statusLower == "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  // Get status display text
  const getStatusDisplay = (status, statusDisplay) => {
    if (statusDisplay) return statusDisplay;
    if (!status) return "-";
    const statusMap = {
      hod_app: "HOD Approved",
      active: "Active",
      expired: "Expired",
      pending: "Pending",
      closed: "Closed",
    };
    return statusMap[status.toLowerCase()] || status;
  };

  // Print Report Content
  const PrintReportContent = () => {
    const filteredData = getFilteredEntries();

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
      departmentSection: {
        marginTop: "20px",
        marginBottom: "20px",
        pageBreakInside: "avoid",
      },
      departmentHeader: {
        backgroundColor: "#FFCDD2",
        padding: "10px",
        fontWeight: "bold",
        fontSize: "14px",
        borderBottom: "2px solid #EF5350",
      },
      tableContainer: {
        width: "100%",
        overflowX: "auto",
        position: "relative",
        marginTop: "10px",
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
      tenderTotalRow: {
        backgroundColor: "#fef3c7",
        fontWeight: "bold",
      },
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <div style={styles.subTitle}>
            Generated Date:{" "}
            {reportData?.generated_date || new Date().toLocaleString()}
          </div>
          {appliedFilters && Object.keys(appliedFilters).length > 0 && (
            <div style={styles.filterInfo}>
              <strong>Filters Applied:</strong>
              {appliedFilters.from_date && ` From: ${appliedFilters.from_date}`}
              {appliedFilters.to_date && ` To: ${appliedFilters.to_date}`}
              {appliedFilters.status && ` Status: ${appliedFilters.status}`}
              {appliedFilters.department_id &&
                ` Department: ${getSelectedDeptDisplay()}`}
              {appliedFilters.tender_id &&
                ` Tender: ${tenders.find((t) => t.id.toString() == appliedFilters.tender_id)?.name || appliedFilters.tender_id}`}
              {appliedFilters.vendor_id &&
                ` Vendor: ${vendors.find((v) => v.id.toString() == appliedFilters.vendor_id)?.name || appliedFilters.vendor_id}`}
              {appliedFilters.work_allocation_id &&
                ` Work Order: ${workAllocations.find((w) => w.id.toString() == appliedFilters.work_allocation_id)?.name || appliedFilters.work_allocation_id}`}
            </div>
          )}
        </div>

        {filteredData.map((dept, deptIdx) => (
          <div
            key={dept.department?.id || deptIdx}
            style={styles.departmentSection}
          >
            <div style={styles.departmentHeader}>
              {dept.department?.name || `Department ${deptIdx + 1}`}
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.thLeft}>Account / Budget Head</th>
                    <th style={styles.thLeft}>Tender No</th>
                    <th style={styles.thLeft}>Work Order No</th>
                    <th style={styles.thLeft}>Work Order Date</th>
                    <th style={styles.thRight}>Order Amount</th>
                    <th style={styles.thLeft}>Vendor Name</th>
                    <th style={styles.thLeft}>BG Date</th>
                    <th style={styles.thRight}>BG Amount</th>
                    <th style={styles.thLeft}>Maturity Date</th>
                    <th style={styles.thLeft}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dept.entries.map((entry, entryIdx) => (
                    <tr key={entry.id || entryIdx}>
                      <td style={styles.tdLeft}>
                        {entry.account_budget_head_name}
                      </td>
                      <td style={styles.tdLeft}>{entry.tender_no || "-"}</td>
                      <td style={styles.tdLeft}>
                        {entry.work_order_no != "-" ? entry.work_order_no : "-"}
                      </td>
                      <td style={styles.tdLeft}>
                        {formatDate(entry.work_order_date)}
                      </td>
                      <td style={styles.tdRight}>
                        {formatAmount(entry.order_amount)}
                      </td>
                      <td style={styles.tdLeft}>{entry.vendor_name || "-"}</td>
                      <td style={styles.tdLeft}>{formatDate(entry.bg_date)}</td>
                      <td style={styles.tdRight}>
                        {formatAmount(entry.bg_amount)}
                      </td>
                      <td style={styles.tdLeft}>
                        {formatDate(entry.maturity_date)}
                      </td>
                      <td style={styles.tdLeft}>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            backgroundColor:
                              entry.status?.toLowerCase() == "hod_app"
                                ? "#d1fae5"
                                : "#fee2e2",
                            color:
                              entry.status?.toLowerCase() == "hod_app"
                                ? "#065f46"
                                : "#991b1b",
                          }}
                        >
                          {entry.status_display}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {dept.summary &&
                  dept.summary.tender_wise_totals &&
                  dept.summary.tender_wise_totals.length > 0 && (
                    <tfoot>
                      {dept.summary.tender_wise_totals.map(
                        (tenderTotal, idx) => (
                          <tr key={idx} style={styles.tenderTotalRow}>
                            <td
                              colSpan="7"
                              style={{ ...styles.tdRight, fontWeight: "bold" }}
                            >
                              Tender Total BG:
                            </td>
                            <td
                              style={{ ...styles.tdRight, fontWeight: "bold" }}
                            >
                              {formatAmount(tenderTotal.total_bg)}
                            </td>
                            <td colSpan="2"></td>
                          </tr>
                        ),
                      )}
                      <tr
                        style={{
                          backgroundColor: "#fce7f3",
                          fontWeight: "bold",
                        }}
                      >
                        <td
                          colSpan="7"
                          style={{ ...styles.tdRight, fontWeight: "bold" }}
                        >
                          Total Department BG:
                        </td>
                        <td style={{ ...styles.tdRight, fontWeight: "bold" }}>
                          {formatAmount(dept.summary.total_department_bg)}
                        </td>
                        <td colSpan="2"></td>
                      </tr>
                    </tfoot>
                  )}
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render item functions
  const renderTenderItem = (tender) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{tender.name}</div>
      <div className="text-xs text-gray-500 mt-1">{tender.subText}</div>
    </div>
  );

  const renderVendorItem = (vendor) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{vendor.name}</div>
      {vendor.subText && (
        <div className="text-xs text-gray-500 mt-1">{vendor.subText}</div>
      )}
    </div>
  );

  const renderWorkAllocItem = (work) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{work.name}</div>
      <div className="text-xs text-gray-500 mt-1">{work.subText}</div>
    </div>
  );

  // Render filters section
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                name="from_date"
                value={filters.from_date}
                onChange={handleDateChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                name="to_date"
                value={filters.to_date}
                onChange={handleDateChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Department Dropdown - Hierarchical */}
          <HierarchicalDepartmentDropdown
            label="Department"
            value={filters.department_id}
            error={null}
            required={false}
            icon={FiFolder}
            isOpen={isDeptDropdownOpen}
            setIsOpen={setIsDeptDropdownOpen}
            searchTerm={deptSearchTerm}
            setSearchTerm={setDeptSearchTerm}
            departments={departments}
            filteredDepartments={filteredDepartments}
            highlightedIndex={deptHighlightedIndex}
            onSelect={handleDeptSelect}
            onKeyDown={handleDeptKeyDown}
            onSearchKeyDown={handleDeptSearchKeyDown}
            onItemKeyDown={handleDeptItemKeyDown}
            getSelectedDisplay={getSelectedDeptDisplay}
            loading={loadingDropdowns}
            placeholder="Select Department"
            searchPlaceholder="Search by department name..."
            buttonRef={deptButtonRef}
            dropdownRef={deptDropdownRef}
            searchRef={deptSearchRef}
            itemRefs={deptItemRefs}
            listRef={deptListRef}
          />

          {/* Tender Dropdown */}
          <SearchableDropdown
            label="Tender"
            value={filters.tender_id}
            error={null}
            required={false}
            icon={FiFileText}
            isOpen={isTenderDropdownOpen}
            setIsOpen={setIsTenderDropdownOpen}
            searchTerm={tenderSearchTerm}
            setSearchTerm={setTenderSearchTerm}
            items={tenders}
            filteredItems={filteredTenders}
            highlightedIndex={tenderHighlightedIndex}
            onSelect={handleTenderSelect}
            onKeyDown={handleTenderKeyDown}
            onSearchKeyDown={handleTenderSearchKeyDown}
            onItemKeyDown={handleTenderItemKeyDown}
            getSelectedDisplay={getSelectedTenderDisplay}
            loading={loadingDropdowns}
            placeholder="Select Tender"
            searchPlaceholder="Search by description or amount..."
            buttonRef={tenderButtonRef}
            dropdownRef={tenderDropdownRef}
            searchRef={tenderSearchRef}
            itemRefs={tenderItemRefs}
            listRef={tenderListRef}
            renderItem={renderTenderItem}
          />

          {/* Vendor Dropdown */}
          <SearchableDropdown
            label="Vendor"
            value={filters.vendor_id}
            error={null}
            required={false}
            icon={FiUsers}
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
            placeholder="Select Vendor"
            searchPlaceholder="Search by name..."
            buttonRef={vendorButtonRef}
            dropdownRef={vendorDropdownRef}
            searchRef={vendorSearchRef}
            itemRefs={vendorItemRefs}
            listRef={vendorListRef}
            renderItem={renderVendorItem}
          />

          {/* Work Allocation Dropdown */}
          <SearchableDropdown
            label="Work Allocation"
            value={filters.work_allocation_id}
            error={null}
            required={false}
            icon={FiHash}
            isOpen={isWorkAllocDropdownOpen}
            setIsOpen={setIsWorkAllocDropdownOpen}
            searchTerm={workAllocSearchTerm}
            setSearchTerm={setWorkAllocSearchTerm}
            items={workAllocations}
            filteredItems={filteredWorkAllocations}
            highlightedIndex={workAllocHighlightedIndex}
            onSelect={handleWorkAllocSelect}
            onKeyDown={handleWorkAllocKeyDown}
            onSearchKeyDown={handleWorkAllocSearchKeyDown}
            onItemKeyDown={handleWorkAllocItemKeyDown}
            getSelectedDisplay={getSelectedWorkAllocDisplay}
            loading={loadingDropdowns}
            placeholder="Select Work Allocation"
            searchPlaceholder="Search by work order or vendor..."
            buttonRef={workAllocButtonRef}
            dropdownRef={workAllocDropdownRef}
            searchRef={workAllocSearchRef}
            itemRefs={workAllocItemRefs}
            listRef={workAllocListRef}
            renderItem={renderWorkAllocItem}
          />
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

            {(hasGenerated || Object.keys(appliedFilters || {}).length > 0) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
              >
                <FiX className="h-4 w-4 mr-2" />
                Clear Filter
              </button>
            )}
          </div>

          {/* Search Box for table results */}
          {hasGenerated && departmentWiseData.length > 0 && (
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
      <p className="mt-2 text-gray-500">
        Loading Departmentwise BG Register data...
      </p>
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
          Select <strong>filters</strong> (optional), then click{" "}
          <span className="font-medium">Generate Report</span>.
        </p>
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Departmentwise BG Register Data Found
        </h3>
        <p className="text-gray-600 mb-4">
          No data available for the selected filters.
        </p>
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center transition-colors"
        >
          <FiX className="h-4 w-4 mr-2" />
          Clear Filter
        </button>
      </div>
    );

  // Render data table
  const renderDataTable = () => {
    const filteredData = getFilteredEntries();

    if (filteredData.length == 0 && searchTerm) {
      return (
        <div className="text-center py-4 text-gray-500">
          No matching records found for "{searchTerm}"
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {filteredData.map((dept, deptIdx) => (
          <div
            key={dept.department?.id || deptIdx}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Department Header with Expand/Collapse */}
            <div
              className="bg-indigo-100 px-4 py-3 cursor-pointer flex justify-between items-center hover:bg-indigo-200 transition-colors"
              onClick={() => toggleDepartment(deptIdx)}
            >
              <div className="flex items-center">
                <span className="font-semibold text-indigo-800">
                  {dept.department?.name || `Department ${deptIdx + 1}`}
                </span>
                <span className="ml-3 text-sm text-indigo-600">
                  ({dept.entries.length} entries)
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-indigo-700">
                  Total BG: {formatAmount(dept.summary?.total_department_bg)}
                </span>
                <button className="text-indigo-600">
                  {expandedDepartments[deptIdx] ? (
                    <FiChevronDown />
                  ) : (
                    <FiChevronRight />
                  )}
                </button>
              </div>
            </div>

            {/* Department Table */}
            {expandedDepartments[deptIdx] && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-emerald-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Account / Budget Head
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Tender No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Work Order No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Work Order Date
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Order Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Vendor Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        BG Date
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        BG Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Maturity Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dept.entries.map((entry, entryIdx) => (
                      <tr
                        key={entry.id || entryIdx}
                        className={`${entryIdx % 2 == 0 ? "bg-white" : "bg-gray-50"} hover:bg-sky-50 transition-colors`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {entry.account_budget_head_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {entry.tender_no || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {entry.work_order_no != "-"
                            ? entry.work_order_no
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDate(entry.work_order_date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                          {formatAmount(entry.order_amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {entry.vendor_name || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDate(entry.bg_date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                          {formatAmount(entry.bg_amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDate(entry.maturity_date)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(entry.status)}`}
                          >
                            {entry.status_display}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {dept.summary &&
                    dept.summary.tender_wise_totals &&
                    dept.summary.tender_wise_totals.length > 0 && (
                      <tfoot>
                        {dept.summary.tender_wise_totals.map(
                          (tenderTotal, idx) => (
                            <tr key={idx} className="bg-amber-50">
                              <td
                                colSpan="7"
                                className="px-4 py-2 text-sm font-semibold text-amber-700 text-right"
                              >
                                Tender Total BG:
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold font-mono text-amber-700">
                                {formatAmount(tenderTotal.total_bg)}
                              </td>
                              <td colSpan="2"></td>
                            </tr>
                          ),
                        )}
                        <tr className="bg-pink-50">
                          <td
                            colSpan="7"
                            className="px-4 py-2 text-sm font-semibold text-rose-700 text-right"
                          >
                            Total Department BG:
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                            {formatAmount(dept.summary.total_department_bg)}
                          </td>
                          <td colSpan="2"></td>
                        </tr>
                      </tfoot>
                    )}
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const hasData = departmentWiseData.length > 0;

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
        {/* Header with back button and print */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>

          <div className="flex space-x-2">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
              title="Export to Excel"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Export Excel
            </button>
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

          {/* No Data State */}
          {!loading && !hasData && message.type != "error" && renderNoData()}

          {/* Data Display */}
          {!loading && hasData && renderDataTable()}
        </div>
      </div>
    </div>
  );
};

export default DepartmentwiseBGRegister;
<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
  Account/Budget Head
</th>;
