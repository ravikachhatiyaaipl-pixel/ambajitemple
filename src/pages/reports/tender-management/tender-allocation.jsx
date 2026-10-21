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
  FiDollarSign,
  FiDownload,
} from "react-icons/fi";
import axios from "axios";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

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
                  item.TnT_ID ||
                  item.SL_Id ||
                  item.TE_Id ||
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

const TenderAllocationReport = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [pageTitle, setPageTitle] = useState("Tender Allocation Report");

  // Dropdown data states
  const [departments, setDepartments] = useState([]);
  const [tenderTypes, setTenderTypes] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    dept_id: "",
    tender_type_id: "",
    vendor_id: "",
    tender_id: "",
    from_date: "",
    to_date: "",
    min_amount: "",
    max_amount: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Search state for table
  const [searchTerm, setSearchTerm] = useState("");

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  // Current page for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(15);

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

  // Tender Type dropdown states
  const [filteredTenderTypes, setFilteredTenderTypes] = useState([]);
  const [tenderTypeSearchTerm, setTenderTypeSearchTerm] = useState("");
  const [isTenderTypeDropdownOpen, setIsTenderTypeDropdownOpen] =
    useState(false);
  const [tenderTypeHighlightedIndex, setTenderTypeHighlightedIndex] =
    useState(-1);
  const tenderTypeDropdownRef = useRef(null);
  const tenderTypeSearchRef = useRef(null);
  const tenderTypeItemRefs = useRef([]);
  const tenderTypeListRef = useRef(null);
  const tenderTypeButtonRef = useRef(null);

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

  const { organization } = useOrganization();

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/tender-management/tender-allocation-report";

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
        tenderTypeDropdownRef.current &&
        !tenderTypeDropdownRef.current.contains(event.target)
      ) {
        setIsTenderTypeDropdownOpen(false);
        setTenderTypeHighlightedIndex(-1);
        setTenderTypeSearchTerm("");
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
        tenderDropdownRef.current &&
        !tenderDropdownRef.current.contains(event.target)
      ) {
        setIsTenderDropdownOpen(false);
        setTenderHighlightedIndex(-1);
        setTenderSearchTerm("");
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
    if (isTenderTypeDropdownOpen && tenderTypeSearchRef.current) {
      setTimeout(() => tenderTypeSearchRef.current.focus(), 0);
    }
  }, [isTenderTypeDropdownOpen]);

  useEffect(() => {
    if (isVendorDropdownOpen && vendorSearchRef.current) {
      setTimeout(() => vendorSearchRef.current.focus(), 0);
    }
  }, [isVendorDropdownOpen]);

  useEffect(() => {
    if (isTenderDropdownOpen && tenderSearchRef.current) {
      setTimeout(() => tenderSearchRef.current.focus(), 0);
    }
  }, [isTenderDropdownOpen]);

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
      tenderTypeListRef,
      tenderTypeItemRefs,
      tenderTypeHighlightedIndex,
      isTenderTypeDropdownOpen,
    );
  }, [tenderTypeHighlightedIndex, isTenderTypeDropdownOpen]);

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
      tenderListRef,
      tenderItemRefs,
      tenderHighlightedIndex,
      isTenderDropdownOpen,
    );
  }, [tenderHighlightedIndex, isTenderDropdownOpen]);

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

  // Filter tender types
  useEffect(() => {
    if (!tenderTypeSearchTerm.trim()) {
      setFilteredTenderTypes(tenderTypes);
    } else {
      const term = tenderTypeSearchTerm.toLowerCase();
      const filtered = tenderTypes.filter(
        (type) =>
          type.name?.toLowerCase().includes(term) ||
          (type.code && type.code.toLowerCase().includes(term)),
      );
      setFilteredTenderTypes(filtered);
    }
    setTenderTypeHighlightedIndex(-1);
  }, [tenderTypeSearchTerm, tenderTypes]);

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

      // Fetch Tender Types
      const tenderTypeResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/tender-type/all`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );
      if (tenderTypeResponse.data?.success) {
        const formattedTenderTypes = tenderTypeResponse.data.data.map(
          (type) => ({
            id: type.TnT_ID,
            name: type.TnT_Name,
            code: type.TnT_Code,
            searchText: `${type.TnT_Name} ${type.TnT_Code || ""}`,
            original: type,
          }),
        );
        setTenderTypes(formattedTenderTypes);
        setFilteredTenderTypes(formattedTenderTypes);
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
          name: tender.Description || `Tender #${tender.TE_Id}`,
          searchText: `${tender.Description || ""} ${tender.tendertype?.TnT_Name || ""} Tender #${tender.TE_Id}`,
          subText: `Type: ${tender.tendertype?.TnT_Name || "N/A"} | Proposal: ₹${parseFloat(tender.Proposal_Amount || 0).toLocaleString("en-IN")}`,
          original: tender,
        }));
        setTenders(formattedTenders);
        setFilteredTenders(formattedTenders);
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

  // Fetch Tender Allocation Report data from API
  const fetchTenderAllocationReportData = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        per_page: perPage,
      };

      if (appliedFilters?.dept_id) params.dept_id = appliedFilters.dept_id;
      if (appliedFilters?.tender_type_id)
        params.tender_type_id = appliedFilters.tender_type_id;
      if (appliedFilters?.vendor_id)
        params.vendor_id = appliedFilters.vendor_id;
      if (appliedFilters?.tender_id)
        params.tender_id = appliedFilters.tender_id;
      if (appliedFilters?.from_date)
        params.from_date = appliedFilters.from_date;
      if (appliedFilters?.to_date) params.to_date = appliedFilters.to_date;
      if (appliedFilters?.min_amount)
        params.min_amount = appliedFilters.min_amount;
      if (appliedFilters?.max_amount)
        params.max_amount = appliedFilters.max_amount;

      const url = `${import.meta.env.VITE_API_URL}/tender-allocation/report`;
      const response = await axios.get(url, { params,
        headers : { 
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
      }
       });

      if (response.data?.success) {
        setReportData(response.data);
        setAllocations(response.data.data || []);
        setSummary(response.data.summary || null);
        setPagination(response.data.pagination || null);

        setMessage({
          text: response.data.message || "Data loaded successfully",
          type: "success",
        });
      } else {
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
        setAllocations([]);
        setSummary(null);
        setPagination(null);
      }
    } catch (err) {
      console.error("Error fetching Tender Allocation Report data:", err);
      setMessage({
        text:
          err.response?.data?.message ||
          "Error loading Tender Allocation Report data",
        type: "error",
      });
      setAllocations([]);
      setSummary(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedFilters(null);
    setAllocations([]);
    setSummary(null);
    setPagination(null);
    setCurrentPage(1);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setFilters({
      dept_id: "",
      tender_type_id: "",
      vendor_id: "",
      tender_id: "",
      from_date: "",
      to_date: "",
      min_amount: "",
      max_amount: "",
    });
    setDeptSearchTerm("");
    setTenderTypeSearchTerm("");
    setVendorSearchTerm("");
    setTenderSearchTerm("");
    setSearchTerm("");
    setCurrentPage(1);
    invalidateReport();
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (hasGenerated) invalidateReport();
  };

  const handleAmountChange = (e) => {
    const { name, value } = e.target;
    // Allow only numbers
    if (value == "" || /^\d*\.?\d*$/.test(value)) {
      setFilters((prev) => ({ ...prev, [name]: value }));
      if (hasGenerated) invalidateReport();
    }
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
    setFilters((prev) => ({ ...prev, dept_id: dept.Dpt_id.toString() }));
    setIsDeptDropdownOpen(false);
    setDeptSearchTerm("");
    setDeptHighlightedIndex(-1);
    if (hasGenerated) invalidateReport();
  };

  const getSelectedDeptDisplay = () => {
    if (!filters.dept_id) return "";
    const selected = departments.find(
      (d) => d.Dpt_id.toString() == filters.dept_id,
    );
    return selected ? `${selected.Dpt_Desc} (${selected.Dpt_Name})` : "";
  };

  // Tender Type keyboard handlers
  const handleTenderTypeKeyDown = (e) => {
    if (
      e.key == "ArrowDown" ||
      e.key == "ArrowUp" ||
      e.key == "Enter" ||
      e.key == " "
    ) {
      e.preventDefault();
      setIsTenderTypeDropdownOpen(true);
      setTenderTypeSearchTerm("");
      setTenderTypeHighlightedIndex(-1);
      setTimeout(() => tenderTypeSearchRef.current?.focus(), 0);
    }
  };

  const handleTenderTypeSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredTenderTypes.length > 0) {
        setTenderTypeHighlightedIndex(0);
        setTimeout(() => {
          if (tenderTypeItemRefs.current[0]) {
            tenderTypeItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderTypeDropdownOpen(false);
      setTenderTypeHighlightedIndex(-1);
      setTenderTypeSearchTerm("");
      tenderTypeButtonRef.current?.focus();
    } else if (e.key == "Enter") {
      e.preventDefault();
      if (filteredTenderTypes.length > 0 && tenderTypeHighlightedIndex >= 0) {
        handleTenderTypeSelect(filteredTenderTypes[tenderTypeHighlightedIndex]);
      } else if (filteredTenderTypes.length > 0) {
        handleTenderTypeSelect(filteredTenderTypes[0]);
      }
    }
  };

  const handleTenderTypeItemKeyDown = (e, item, idx) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredTenderTypes.length) {
        setTenderTypeHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (tenderTypeItemRefs.current[nextIndex]) {
            tenderTypeItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setTenderTypeHighlightedIndex(-1);
        setTimeout(() => tenderTypeSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setTenderTypeHighlightedIndex(-1);
        setTimeout(() => tenderTypeSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setTenderTypeHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (tenderTypeItemRefs.current[prevIndex]) {
            tenderTypeItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleTenderTypeSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsTenderTypeDropdownOpen(false);
      setTenderTypeHighlightedIndex(-1);
      setTenderTypeSearchTerm("");
      tenderTypeButtonRef.current?.focus();
    }
  };

  const handleTenderTypeSelect = (tenderType) => {
    setFilters((prev) => ({
      ...prev,
      tender_type_id: tenderType.id.toString(),
    }));
    setIsTenderTypeDropdownOpen(false);
    setTenderTypeSearchTerm("");
    setTenderTypeHighlightedIndex(-1);
    if (hasGenerated) invalidateReport();
  };

  const getSelectedTenderTypeDisplay = () => {
    if (!filters.tender_type_id) return "";
    const selected = tenderTypes.find(
      (t) => t.id.toString() == filters.tender_type_id,
    );
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

  const handleGenerateReport = async () => {
    const filtersToApply = { ...filters };

    // Remove empty values
    Object.keys(filtersToApply).forEach((key) => {
      if (!filtersToApply[key] || filtersToApply[key].trim() == "") {
        delete filtersToApply[key];
      }
    });

    setAppliedFilters(filtersToApply);
    setHasGenerated(true);
    setCurrentPage(1);
    await fetchTenderAllocationReportData(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && pagination && newPage <= pagination.last_page) {
      setCurrentPage(newPage);
      fetchTenderAllocationReportData(newPage);
    }
  };

  // Filter allocations based on search term
  const getFilteredAllocations = () => {
    if (!searchTerm.trim()) return allocations;

    const searchLower = searchTerm.toLowerCase();
    return allocations.filter(
      (allocation) =>
        (allocation.tender_no &&
          allocation.tender_no.toLowerCase().includes(searchLower)) ||
        (allocation.tender_type_name &&
          allocation.tender_type_name.toLowerCase().includes(searchLower)) ||
        (allocation.vendor_name &&
          allocation.vendor_name.toLowerCase().includes(searchLower)) ||
        (allocation.work_order_no &&
          allocation.work_order_no.toLowerCase().includes(searchLower)) ||
        (allocation.department_name &&
          allocation.department_name.toLowerCase().includes(searchLower)),
    );
  };

  // Format amount
  const formatAmount = (amount) => {
    if (amount == undefined || amount == null) return "₹ 0.00";

    try {
      const num =
        typeof amount == "string"
          ? parseFloat(amount.replace(/,/g, ""))
          : parseFloat(amount);
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
      let date;
      if (typeof dateString == "string" && dateString.includes("T")) {
        date = new Date(dateString);
      } else if (typeof dateString == "string") {
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

  // Export to Excel
  const exportToExcel = () => {
    if (allocations.length == 0) {
      setMessage({ text: "No data to export", type: "info" });
      return;
    }

    const filteredAllocations = getFilteredAllocations();

    // Prepare data for Excel
    const excelData = filteredAllocations.map((allocation) => ({
      "Tender No": allocation.tender_no || "-",
      "Tender Type": allocation.tender_type_name || "-",
      "Tender Date": formatDate(allocation.tender_date),
      "Vendor Name": allocation.vendor_name || "-",
      "Tender Proposed Amount": allocation.tender_proposed_amount || 0,
      "Work Order No": allocation.work_order_no || "-",
      "Work Order Date": formatDate(allocation.work_order_date),
      "Work Order Amount": allocation.work_order_amount || 0,
    }));

    // Add summary row if summary exists
    if (summary) {
      excelData.push({
        "Tender No": "TOTAL",
        "Tender Type": "",
        "Tender Date": "",
        "Vendor Name": "",
        "Tender Proposed Amount": summary.total_proposed_amount || 0,
        "Work Order No": "",
        "Work Order Date": "",
        "Work Order Amount": summary.total_work_order_amount || 0,
      });
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Tender No
      { wch: 20 }, // Tender Type
      { wch: 15 }, // Tender Date
      { wch: 30 }, // Vendor Name
      { wch: 20 }, // Tender Proposed Amount
      { wch: 15 }, // Work Order No
      { wch: 15 }, // Work Order Date
      { wch: 20 }, // Work Order Amount
    ];
    ws["!cols"] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tender Allocation Report");

    // Generate filename with date
    const fileName = `${pageTitle.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.xlsx`;

    // Export
    XLSX.writeFile(wb, fileName);

    setMessage({
      text: "Report exported to Excel successfully",
      type: "success",
    });
    setTimeout(() => {
      if (message.type == "success") {
        setMessage({ text: "", type: "" });
      }
    }, 3000);
  };

  // Print Report Content - Updated to show total only once at the end
  const PrintReportContent = () => {
    const filteredAllocations = getFilteredAllocations();

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
        backgroundColor: "#ffffff",
        fontWeight: "bold",
        padding: "8px",
        border: "1px solid #d1d5db",
        textAlign: "center",
        color: "#000000",
      },
      thLeft: {
        backgroundColor: "#ffffff",
        fontWeight: "bold",
        padding: "8px",
        border: "1px solid #d1d5db",
        textAlign: "left",
        color: "#000000",
      },
      thRight: {
        backgroundColor: "#ffffff",
        fontWeight: "bold",
        padding: "8px",
        border: "1px solid #d1d5db",
        textAlign: "right",
        color: "#000000",
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
        backgroundColor: "#ffffff",
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
          {appliedFilters && Object.keys(appliedFilters).length > 0 && (
            <div style={styles.filterInfo}>
              <strong>Filters Applied:</strong>
              {appliedFilters.from_date && ` From: ${appliedFilters.from_date}`}
              {appliedFilters.to_date && ` To: ${appliedFilters.to_date}`}
              {appliedFilters.dept_id &&
                ` Department: ${getSelectedDeptDisplay()}`}
              {appliedFilters.tender_type_id &&
                ` Tender Type: ${getSelectedTenderTypeDisplay()}`}
              {appliedFilters.vendor_id &&
                ` Vendor: ${getSelectedVendorDisplay()}`}
              {appliedFilters.tender_id &&
                ` Tender: ${getSelectedTenderDisplay()}`}
              {appliedFilters.min_amount &&
                ` Min Amount: ${formatAmount(appliedFilters.min_amount)}`}
              {appliedFilters.max_amount &&
                ` Max Amount: ${formatAmount(appliedFilters.max_amount)}`}
            </div>
          )}
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thLeft}>Tender No</th>
                <th style={styles.thLeft}>Tender Type</th>
                <th style={styles.thLeft}>Tender Date</th>
                <th style={styles.thLeft}>Vendor Name</th>
                <th style={styles.thRight}>Tender Proposed Amount</th>
                <th style={styles.thLeft}>Work Order No</th>
                <th style={styles.thLeft}>Work Order Date</th>
                <th style={styles.thRight}>Work Order Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredAllocations.map((allocation, index) => (
                <tr key={allocation.allocation_id || index}>
                  <td style={styles.tdLeft}>{allocation.tender_no || "-"}</td>
                  <td style={styles.tdLeft}>
                    {allocation.tender_type_name || "-"}
                  </td>
                  <td style={styles.tdLeft}>
                    {allocation.formatted_tender_date || "-"}
                  </td>
                  <td style={styles.tdLeft}>{allocation.vendor_name || "-"}</td>
                  <td style={styles.tdRight}>
                    {allocation.formatted_tender_proposed_amount ||
                      formatAmount(allocation.tender_proposed_amount)}
                  </td>
                  <td style={styles.tdLeft}>
                    {allocation.work_order_no || "-"}
                  </td>
                  <td style={styles.tdLeft}>
                    {allocation.formatted_work_order_date ||
                      formatDate(allocation.work_order_date)}
                  </td>
                  <td style={styles.tdRight}>
                    {allocation.formatted_work_order_amount ||
                      formatAmount(allocation.work_order_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Total row only at the end - ONE TIME ONLY */}
            {summary && filteredAllocations.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: "#ffffff", fontWeight: "bold" }}>
                  <td
                    colSpan="4"
                    style={{ ...styles.tdRight, fontWeight: "bold" }}
                  >
                    TOTAL
                  </td>
                  <td style={{ ...styles.tdRight, fontWeight: "bold" }}>
                    {summary.formatted_total_proposed ||
                      formatAmount(summary.total_proposed_amount)}
                  </td>
                  <td style={styles.tdLeft}></td>
                  <td style={styles.tdLeft}></td>
                  <td style={{ ...styles.tdRight, fontWeight: "bold" }}>
                    {summary.formatted_total_work_order ||
                      formatAmount(summary.total_work_order_amount)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  // Render item functions
  const renderTenderTypeItem = (tenderType) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{tenderType.name}</div>
      {tenderType.code && (
        <div className="text-xs text-gray-500 mt-1">
          Code: {tenderType.code}
        </div>
      )}
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

  const renderTenderItem = (tender) => (
    <div className="py-1">
      <div className="font-medium text-gray-900">{tender.name}</div>
      <div className="text-xs text-gray-500 mt-1">{tender.subText}</div>
    </div>
  );

  // Render filters section
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* From Date */}
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

          {/* To Date */}
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

          {/* Department Dropdown */}
          <HierarchicalDepartmentDropdown
            label="Department"
            value={filters.dept_id}
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

          {/* Tender Type Dropdown */}
          <SearchableDropdown
            label="Tender Type"
            value={filters.tender_type_id}
            error={null}
            required={false}
            icon={FiFileText}
            isOpen={isTenderTypeDropdownOpen}
            setIsOpen={setIsTenderTypeDropdownOpen}
            searchTerm={tenderTypeSearchTerm}
            setSearchTerm={setTenderTypeSearchTerm}
            items={tenderTypes}
            filteredItems={filteredTenderTypes}
            highlightedIndex={tenderTypeHighlightedIndex}
            onSelect={handleTenderTypeSelect}
            onKeyDown={handleTenderTypeKeyDown}
            onSearchKeyDown={handleTenderTypeSearchKeyDown}
            onItemKeyDown={handleTenderTypeItemKeyDown}
            getSelectedDisplay={getSelectedTenderTypeDisplay}
            loading={loadingDropdowns}
            placeholder="Select Tender Type"
            searchPlaceholder="Search by tender type name..."
            buttonRef={tenderTypeButtonRef}
            dropdownRef={tenderTypeDropdownRef}
            searchRef={tenderTypeSearchRef}
            itemRefs={tenderTypeItemRefs}
            listRef={tenderTypeListRef}
            renderItem={renderTenderTypeItem}
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
            searchPlaceholder="Search by vendor name..."
            buttonRef={vendorButtonRef}
            dropdownRef={vendorDropdownRef}
            searchRef={vendorSearchRef}
            itemRefs={vendorItemRefs}
            listRef={vendorListRef}
            renderItem={renderVendorItem}
          />

          {/* Tender Dropdown */}
          <SearchableDropdown
            label="Tender"
            value={filters.tender_id}
            error={null}
            required={false}
            icon={FiHash}
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
            searchPlaceholder="Search by tender name..."
            buttonRef={tenderButtonRef}
            dropdownRef={tenderDropdownRef}
            searchRef={tenderSearchRef}
            itemRefs={tenderItemRefs}
            listRef={tenderListRef}
            renderItem={renderTenderItem}
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
          {hasGenerated && allocations.length > 0 && (
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
        Loading Tender Allocation Report data...
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
          No Tender Allocation Data Found
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
    const filteredAllocations = getFilteredAllocations();

    if (filteredAllocations.length == 0 && searchTerm) {
      return (
        <div className="text-center py-4 text-gray-500">
          No matching records found for "{searchTerm}"
        </div>
      );
    }

    return (
      <div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Tender No
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Tender Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Tender Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Vendor Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Tender Proposed Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Work Order No
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Work Order Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300">
                  Work Order Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAllocations.map((allocation, idx) => (
                <tr
                  key={allocation.allocation_id || idx}
                  className={`${idx % 2 == 0 ? "bg-white" : "bg-white"} hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                    {allocation.tender_no || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                    {allocation.tender_type_name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                    {allocation.formatted_tender_date || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                    {allocation.vendor_name || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-black border-r border-gray-300">
                    {allocation.formatted_tender_proposed_amount ||
                      formatAmount(allocation.tender_proposed_amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                    {allocation.work_order_no || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                    {allocation.formatted_work_order_date ||
                      formatDate(allocation.work_order_date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-black">
                    {allocation.formatted_work_order_amount ||
                      formatAmount(allocation.work_order_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            {summary && hasGenerated && (
              <tfoot className="bg-white">
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-3 text-sm font-semibold text-black border-t border-gray-300"
                  ></td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-black border-t border-gray-300">
                    {summary.formatted_total_proposed ||
                      formatAmount(summary.total_proposed_amount)}
                  </td>
                  <td className="px-4 py-3 border-t border-gray-300"></td>
                  <td className="px-4 py-3 border-t border-gray-300"></td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-black border-t border-gray-300">
                    {summary.formatted_total_work_order ||
                      formatAmount(summary.total_work_order_amount)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Showing {pagination.from || 0} to {pagination.to || 0} of{" "}
              {pagination.total || 0} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage == 1}
                className={`px-3 py-1 rounded border ${
                  currentPage == 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <span className="px-3 py-1 rounded border bg-blue-50 text-blue-600">
                {currentPage}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage == pagination.last_page}
                className={`px-3 py-1 rounded border ${
                  currentPage == pagination.last_page
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const hasData = allocations.length > 0;

  // Message auto-dismiss effect
  useEffect(() => {
    if (message.text && message.type != "error") {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
        {/* Header with back button and action buttons */}
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
              Export
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

        {/* Success/Error Message */}
        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
              message.type == "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : message.type == "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            <div className="flex items-center">
              {message.type == "error" && (
                <FiAlertCircle className="h-4 w-4 mr-2" />
              )}
              {message.type == "success" && (
                <FiCheck className="h-4 w-4 mr-2" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage({ text: "", type: "" })}>
              <FiX className="h-4 w-4" />
            </button>
          </div>
        )}

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

export default TenderAllocationReport;
