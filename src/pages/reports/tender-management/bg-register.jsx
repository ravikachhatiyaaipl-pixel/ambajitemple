
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
                  item.TE_Id ||
                  item.SL_Id ||
                  item.WA_Id ||
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

const BGRegister = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pageTitle, setPageTitle] = useState("BG Register");

  // Dropdown data states
  const [tenders, setTenders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [workAllocations, setWorkAllocations] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    from_date: "",
    to_date: "",
    tender_id: "",
    vendor_id: "",
    work_allocation_id: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Search state for table
  const [searchTerm, setSearchTerm] = useState("");

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

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
      const currentPath = "/tender-management/bg-register";

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

  // Fetch BG Register data from API
  const fetchBGRegisterData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (appliedFilters?.from_date)
        params.from_date = appliedFilters.from_date;
      if (appliedFilters?.to_date) params.to_date = appliedFilters.to_date;
      if (appliedFilters?.tender_id)
        params.tender_id = appliedFilters.tender_id;
      if (appliedFilters?.vendor_id)
        params.vendor_id = appliedFilters.vendor_id;
      if (appliedFilters?.work_allocation_id)
        params.work_allocation_id = appliedFilters.work_allocation_id;

      const url = `${import.meta.env.VITE_API_URL}/bg-register`;
      const response = await axios.get(url, { params,
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
         });

      if (response.data?.success) {
        setReportData(response.data.data);
        // Process entries to ensure proper data formatting
        const processedEntries = (response.data.data?.entries || []).map(
          (entry) => ({
            ...entry,
            bg_amount_raw: parseFloat(entry.bg_amount || 0),
            bg_amount: `₹ ${parseFloat(entry.bg_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            order_amount: `₹ ${parseFloat(entry.order_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            status_display: entry.status_display || entry.status || "-",
            work_order_no: entry.work_order_no || "-",
            vendor_name: entry.vendor_name || "-",
            tender_no: entry.tender_no || "-",
          }),
        );
        setEntries(processedEntries);
        setSummary(response.data.data?.summary || null);

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
      }
    } catch (err) {
      console.error("Error fetching BG Register data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading BG Register data",
        type: "error",
      });
      setEntries([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedFilters(null);
    setEntries([]);
    setSummary(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setFilters({
      from_date: "",
      to_date: "",
      tender_id: "",
      vendor_id: "",
      work_allocation_id: "",
    });
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
    setAppliedFilters({ ...filters });
    setHasGenerated(true);
    await fetchBGRegisterData();
  };

  // Excel Export Function
  const exportToExcel = () => {
    if (!entries.length) return;

    // Prepare data for Excel
    const excelData = entries.map((entry) => ({
      "Tender No": entry.tender_no || "-",
      "Work Order No": entry.work_order_no || "-",
      "Work Order Date": formatDate(entry.work_order_date),
      "Order Amount (₹)": entry.order_amount || "0.00",
      "Vendor Name": entry.vendor_name || "-",
      "BG Date": formatDate(entry.bg_date),
      "BG Amount (₹)": entry.bg_amount || "0.00",
      "BG Type": entry.bg_type || "-",
      "Maturity Date": formatDate(entry.maturity_date),
      Status: entry.status_display || "-",
      "Reference CD": entry.reference_cd || "-",
      Remarks: entry.remarks || "-",
    }));

    // Add summary row if available
    if (summary) {
      excelData.push({});
      excelData.push({
        "Tender No": "TOTAL",
        "BG Amount (₹)": summary.total_bg_amount || "0.00",
        "Total Records": summary.total_records || 0,
      });
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Tender No
      { wch: 18 }, // Work Order No
      { wch: 18 }, // Work Order Date
      { wch: 20 }, // Order Amount
      { wch: 35 }, // Vendor Name
      { wch: 15 }, // BG Date
      { wch: 20 }, // BG Amount
      { wch: 12 }, // BG Type
      { wch: 15 }, // Maturity Date
      { wch: 15 }, // Status
      { wch: 15 }, // Reference CD
      { wch: 30 }, // Remarks
    ];
    ws["!cols"] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BG Register");

    // Generate filename with current date
    const fileName = `BG_Register_${new Date().toISOString().split("T")[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  // Filter entries based on search term
  const getFilteredEntries = () => {
    if (!searchTerm.trim()) return entries;

    const searchLower = searchTerm.toLowerCase();
    return entries.filter(
      (entry) =>
        (entry.tender_no &&
          entry.tender_no.toLowerCase().includes(searchLower)) ||
        (entry.work_order_no &&
          entry.work_order_no.toLowerCase().includes(searchLower)) ||
        (entry.vendor_name &&
          entry.vendor_name.toLowerCase().includes(searchLower)) ||
        (entry.status_display &&
          entry.status_display.toLowerCase().includes(searchLower)) ||
        (entry.bg_type && entry.bg_type.toLowerCase().includes(searchLower)),
    );
  };

  // Format amount for display
  const formatAmountDisplay = (amount) => {
    if (!amount || amount == "-") return "₹ 0.00";
    return amount;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
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
  const getStatusDisplay = (entry) => {
    if (entry.status_display) return entry.status_display;
    if (entry.status == "hod_app") return "HOD Approved";
    return entry.status || "-";
  };

  // Print Report Content
  const PrintReportContent = () => {
    const filteredEntries = getFilteredEntries();

    // Calculate total BG amount from filtered entries for print
    const printTotalBGAmount = filteredEntries.reduce((sum, entry) => {
      const amount = entry.bg_amount_raw || 0;
      return sum + amount;
    }, 0);

    const styles = {
      page: {
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        fontSize: "10px",
        position: "relative",
      },
      header: {
        textAlign: "center",
        marginBottom: "20px",
        borderBottom: "2px solid #333",
        paddingBottom: "10px",
      },
      title: {
        fontSize: "16px",
        fontWeight: "bold",
        margin: "5px 0",
      },
      subTitle: {
        fontSize: "10px",
        color: "#666",
        marginTop: "5px",
      },
      filterInfo: {
        marginTop: "10px",
        padding: "8px",
        backgroundColor: "#f9fafb",
        borderRadius: "4px",
        fontSize: "9px",
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
        fontSize: "9px",
      },
      th: {
        backgroundColor: "#ffffff",
        fontWeight: "600",
        padding: "6px",
        border: "1px solid #333",
        textAlign: "center",
        color: "#000000",
      },
      thLeft: {
        backgroundColor: "#ffffff",
        fontWeight: "600",
        padding: "6px",
        border: "1px solid #333",
        textAlign: "left",
        color: "#000000",
      },
      thRight: {
        backgroundColor: "#ffffff",
        fontWeight: "600",
        padding: "6px",
        border: "1px solid #333",
        textAlign: "right",
        color: "#000000",
      },
      td: {
        padding: "5px 6px",
        border: "1px solid #333",
        verticalAlign: "top",
        color: "#000000",
      },
      tdLeft: {
        padding: "5px 6px",
        border: "1px solid #333",
        verticalAlign: "top",
        textAlign: "left",
        color: "#000000",
      },
      tdRight: {
        padding: "5px 6px",
        border: "1px solid #333",
        verticalAlign: "top",
        textAlign: "right",
        color: "#000000",
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
          {appliedFilters && Object.values(appliedFilters).some((v) => v) && (
            <div style={styles.filterInfo}>
              <strong>Filters Applied:</strong>
              {appliedFilters.from_date && ` From: ${appliedFilters.from_date}`}
              {appliedFilters.to_date && ` To: ${appliedFilters.to_date}`}
              {appliedFilters.tender_id &&
                ` Tender: ${tenders.find((t) => t.id.toString() == appliedFilters.tender_id)?.name || appliedFilters.tender_id}`}
              {appliedFilters.vendor_id &&
                ` Vendor: ${vendors.find((v) => v.id.toString() == appliedFilters.vendor_id)?.name || appliedFilters.vendor_id}`}
              {appliedFilters.work_allocation_id &&
                ` Work Order: ${workAllocations.find((w) => w.id.toString() == appliedFilters.work_allocation_id)?.name || appliedFilters.work_allocation_id}`}
            </div>
          )}
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thLeft}>Tender No</th>
                <th style={styles.thLeft}>Work Order No</th>
                <th style={styles.thLeft}>Work Order Date</th>
                <th style={styles.thRight}>Order Amount (₹)</th>
                <th style={styles.thLeft}>Vendor Name</th>
                <th style={styles.thLeft}>BG Date</th>
                <th style={styles.thRight}>BG Amount (₹)</th>
                <th style={styles.thLeft}>BG Type</th>
                <th style={styles.thLeft}>Maturity Date</th>
                <th style={styles.thLeft}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => (
                <tr key={entry.id || index}>
                  <td style={styles.tdLeft}>{entry.tender_no || "-"}</td>
                  <td style={styles.tdLeft}>{entry.work_order_no || "-"}</td>
                  <td style={styles.tdLeft}>
                    {formatDate(entry.work_order_date)}
                  </td>
                  <td style={styles.tdRight}>
                    {entry.order_amount || "₹ 0.00"}
                  </td>
                  <td style={styles.tdLeft}>{entry.vendor_name || "-"}</td>
                  <td style={styles.tdLeft}>{formatDate(entry.bg_date)}</td>
                  <td style={styles.tdRight}>{entry.bg_amount || "₹ 0.00"}</td>
                  <td style={styles.tdLeft}>{entry.bg_type || "-"}</td>
                  <td style={styles.tdLeft}>
                    {formatDate(entry.maturity_date)}
                  </td>
                  <td style={styles.tdLeft}>{getStatusDisplay(entry)}</td>
                </tr>
              ))}
            </tbody>
            {filteredEntries.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan="10" style={{ padding: "5px 6px", borderTop: "2px solid #333", borderLeft: "1px solid #333", borderRight: "1px solid #333", borderBottom: "1px solid #333", fontWeight: "bold", color: "#000000" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>TOTAL BG AMOUNT</span>
                      <span>₹{" "}{printTotalBGAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
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

            {(hasGenerated || appliedFilters) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
              >
                <FiX className="h-4 w-4 mr-2" />
                Clear Filter
              </button>
            )}
          </div>

          <div className="flex gap-3">
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
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500">Loading BG Register data...</p>
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
          No BG Register Data Found
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
    const filteredEntries = getFilteredEntries();
    const totalBGAmount = filteredEntries.reduce((sum, entry) => sum + (entry.bg_amount_raw || 0), 0);

    return (
      <div>
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">Tender No</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">Work Order No</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">Work Order Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">Order Amount (₹)</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">Vendor Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">BG Date</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">BG Amount (₹)</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">BG Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">Maturity Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredEntries.map((entry, idx) => (
                  <tr key={entry.id || idx} className="border-b border-gray-300">
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{entry.tender_no || "-"}</td>
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{entry.work_order_no || "-"}</td>
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{formatDate(entry.work_order_date)}</td>
                    <td className="px-4 py-3 text-sm text-right text-black border-r border-gray-300">{entry.order_amount || "₹ 0.00"}</td>
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{entry.vendor_name || "-"}</td>
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{formatDate(entry.bg_date)}</td>
                    <td className="px-4 py-3 text-sm text-right text-black border-r border-gray-300">{entry.bg_amount || "₹ 0.00"}</td>
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{entry.bg_type || "-"}</td>
                    <td className="px-4 py-3 text-sm text-black border-r border-gray-300">{formatDate(entry.maturity_date)}</td>
                    <td className="px-4 py-3 text-sm text-black">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(entry.status)}`}>
                        {getStatusDisplay(entry)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {filteredEntries.length > 0 && (
                <tfoot>
                  <tr className="bg-white font-bold text-black border-t-2 border-gray-300">
                    <td colSpan={6} className="px-4 py-3 text-sm">TOTAL BG AMOUNT</td>
                    <td className="px-4 py-3 text-sm text-right">
                      ₹ {totalBGAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td colSpan={3} className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
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
        {/* Header with back button, print and excel buttons */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>

          <div className="flex space-x-2">
            {/* Excel Export Button - placed next to Print button */}
            {hasData && !loading && (
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
                title="Export to Excel"
              >
                <FiDownload className="h-4 w-4 mr-2" />
                Excel
              </button>
            )}
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

export default BGRegister;
