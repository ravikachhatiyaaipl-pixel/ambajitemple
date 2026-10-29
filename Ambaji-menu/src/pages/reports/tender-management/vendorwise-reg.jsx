import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiHome,
  FiX,
  FiSearch,
  FiChevronDown,
  FiCheck,
  FiLayers,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiFileText,
} from "react-icons/fi";
import { BiLoader } from "react-icons/bi";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import axios from "axios";
import { Link } from "react-router-dom";
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
  getId = (item) => item?.id,
  disabled = false,
  renderItem,
  showAsText = false,
  lockedValue = "",
  includeAllOption = false,
  allOptionLabel = "All Vendors",
  allOptionValue = "all",
}) => {
  const handleWheel = (e) => {
    e.stopPropagation();
  };

  if (showAsText) {
    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          )}
          <div
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700`}
          >
            {lockedValue || "Auto-filled"}
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Auto-filled from selection (non-editable)
        </p>
      </div>
    );
  }

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
          <BiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <FiLayers className="h-4 w-4 mr-2" />
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

            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const itemId = item?.Vendor_id || item?.id || `item-${idx}`;

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
                      onSelect(item);
                    }}
                    onKeyDown={(e) => onItemKeyDown(e, idx, item)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                      highlightedIndex == idx
                        ? "bg-blue-100"
                        : value && itemId && value == itemId.toString()
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                    }`}
                    tabIndex={0}
                  >
                    {renderItem
                      ? renderItem(item)
                      : item?.Vendor_Name || item?.name}
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
                <p>No vendors found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredItems.length} vendors found</span>
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

const VendorwiseReg = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [appliedVendor, setAppliedVendor] = useState("");
  const [appliedVendorData, setAppliedVendorData] = useState(null);
  const [vendorWiseData, setVendorWiseData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [reportInfo, setReportInfo] = useState({
    report_name: "",
    generated_date: "",
    filters_applied: {},
  });
  const [hasGenerated, setHasGenerated] = useState(false);
  const [pageTitle, setPageTitle] = useState("Vendor-wise Tender Register");

  // Date filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  // Sort states
  const [sortBy, setSortBy] = useState("work_order_amount");
  const [sortOrder, setSortOrder] = useState("desc");
  const [appliedSortBy, setAppliedSortBy] = useState("work_order_amount");
  const [appliedSortOrder, setAppliedSortOrder] = useState("desc");

  // Vendor dropdown states
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [vendorHighlightedIndex, setVendorHighlightedIndex] = useState(-1);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const vendorDropdownRef = useRef(null);
  const vendorSearchRef = useRef(null);
  const vendorButtonRef = useRef(null);
  const vendorItemRefs = useRef([]);
  const vendorListRef = useRef(null);

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/tender-management/vendorwise-reg";
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

  // Load vendors
  const loadVendors = async () => {
    setDropdownLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tender-reports/vendorwise`,
        {
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
        }
      );

      if (response.data.success && response.data.data) {
        // Extract unique vendors from response
        const uniqueVendors = {};
        response.data.data.forEach((vendor) => {
          if (vendor.vendor_id && !uniqueVendors[vendor.vendor_id]) {
            uniqueVendors[vendor.vendor_id] = {
              Vendor_id: vendor.vendor_id,
              Vendor_Name: vendor.vendor_name,
              Vendor_Code: vendor.vendor_code,
            };
          }
        });
        setVendors(Object.values(uniqueVendors));
        setFilteredVendors(Object.values(uniqueVendors));
      }
    } catch (error) {
      console.error("Failed to load vendors:", error);
    } finally {
      setDropdownLoading(false);
    }
  };

  // Load vendors on mount
  useEffect(() => {
    loadVendors();
  }, []);

  // Filter vendors based on search term
  useEffect(() => {
    if (!vendors.length) return;

    if (!vendorSearchTerm.trim()) {
      setFilteredVendors(vendors);
    } else {
      const term = vendorSearchTerm.toLowerCase();
      const filtered = vendors.filter(
        (vendor) =>
          vendor.Vendor_Name?.toLowerCase().includes(term) ||
          vendor.Vendor_Code?.toLowerCase().includes(term),
      );
      setFilteredVendors(filtered);
    }
    setVendorHighlightedIndex(-1);
  }, [vendorSearchTerm, vendors]);

  // Fetch vendor-wise report data
  const fetchVendorwiseReport = async () => {
    setLoading(true);
    try {
      const params = {};

      if (appliedVendor && appliedVendor != "all") {
        params.vendor_id = appliedVendor;
      }
      if (appliedFromDate) params.from_date = appliedFromDate;
      if (appliedToDate) params.to_date = appliedToDate;
      params.sort_by = appliedSortBy;
      params.sort_order = appliedSortOrder;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tender-reports/vendorwise`,
        { params,
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
         },
      );

      if (response.data.success) {
        setReportInfo({
          report_name: response.data.report_name || pageTitle,
          generated_date:
            response.data.report_date || new Date().toLocaleString(),
          filters_applied: response.data.filters_applied || {},
        });
        setSummary(response.data.summary || null);
        setVendorWiseData(response.data.data || []);

        setMessage({
          text: response.data.message || "Report generated successfully",
          type: "success",
        });
      } else {
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
        setVendorWiseData([]);
        setSummary(null);
      }
    } catch (err) {
      console.error("Error fetching vendorwise report:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading vendorwise report",
        type: "error",
      });
      setVendorWiseData([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // =============  CLICK OUTSIDE HANDLER ==============
  useEffect(() => {
    const handleClickOutside = (event) => {
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

  // =============  FOCUS SEARCH WHEN DROPDOWN OPENS ==============
  useEffect(() => {
    if (isVendorDropdownOpen && vendorSearchRef.current) {
      setTimeout(() => vendorSearchRef.current.focus(), 0);
    }
  }, [isVendorDropdownOpen]);

  // =============  SCROLL HIGHLIGHTED ITEM INTO VIEW ==============
  useEffect(() => {
    if (
      isVendorDropdownOpen &&
      vendorHighlightedIndex >= 0 &&
      vendorListRef.current
    ) {
      const container = vendorListRef.current;
      const item = vendorItemRefs.current[vendorHighlightedIndex];
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
  }, [vendorHighlightedIndex, isVendorDropdownOpen]);

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedVendor("");
    setAppliedVendorData(null);
    setAppliedFromDate("");
    setAppliedToDate("");
    setAppliedSortBy("work_order_amount");
    setAppliedSortOrder("desc");
    setVendorWiseData([]);
    setSummary(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setSelectedVendor("all");
    setFromDate("");
    setToDate("");
    setSortBy("work_order_amount");
    setSortOrder("desc");
    invalidateReport();
  };

  const handleGenerateReport = async () => {
    // Lock current filters as applied filters
    setAppliedVendor(selectedVendor);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedSortBy(sortBy);
    setAppliedSortOrder(sortOrder);
    setHasGenerated(true);
    setMessage({ text: "", type: "" });

    // Store selected vendor data for display
    if (selectedVendor && selectedVendor != "all") {
      const selected = vendors.find(
        (v) => v.Vendor_id?.toString() == selectedVendor,
      );
      setAppliedVendorData(selected || null);
    } else {
      setAppliedVendorData(null);
    }

    await fetchVendorwiseReport();
  };

  // =============  VENDOR DISPLAY FUNCTIONS ==============
  const getVendorDisplayName = (vendor) => {
    if (!vendor) return "";
    const name = vendor.Vendor_Name || vendor.name;
    const code = vendor.Vendor_Code || vendor.code;
    if (code) {
      return `${name} (${code})`;
    }
    return name;
  };

  const renderVendorItem = (vendor) => {
    const name = vendor.Vendor_Name || vendor.name;
    const code = vendor.Vendor_Code || vendor.code;
    const colorClass = "bg-blue-100 text-blue-600";

    return (
      <div className="py-1">
        <div className="flex items-start">
          <div
            className={`h-6 w-6 rounded flex items-center justify-center mr-3 flex-shrink-0 ${colorClass}`}
          >
            <FiUser className="h-3 w-3" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">{name}</div>
            {code && (
              <div className="text-xs text-gray-500 mt-0.5">Code: {code}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getSelectedVendorDisplay = () => {
    if (selectedVendor == "all") return "All Vendors";
    if (!selectedVendor) return "";
    const selected = vendors.find(
      (v) => v.Vendor_id?.toString() == selectedVendor,
    );
    if (!selected) return "Selected vendor not found";
    return getVendorDisplayName(selected);
  };

  const getAppliedVendorDisplay = () => {
    if (appliedVendor == "all") return "All Vendors";
    if (!appliedVendorData) return "";
    return getVendorDisplayName(appliedVendorData);
  };

  // Vendor select handler
  const handleVendorSelect = (vendor) => {
    if (vendor && vendor.isAllOption) {
      setSelectedVendor("all");
    } else if (vendor && (vendor.Vendor_id || vendor.id)) {
      const vendorId = (vendor.Vendor_id || vendor.id).toString();
      setSelectedVendor(vendorId);
    }
    setIsVendorDropdownOpen(false);
    setVendorSearchTerm("");
    setVendorHighlightedIndex(-1);

    // If the report is already visible, require regeneration after filter change
    if (hasGenerated) invalidateReport();
  };

  // Vendor dropdown key handlers
  const handleVendorKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isVendorDropdownOpen) {
        setIsVendorDropdownOpen(true);
        setVendorSearchTerm("");
        setVendorHighlightedIndex(-1);
        setTimeout(() => vendorSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isVendorDropdownOpen) {
        setIsVendorDropdownOpen(false);
        setVendorHighlightedIndex(-1);
        setVendorSearchTerm("");
      }
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

  const handleVendorItemKeyDown = (e, idx, item) => {
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

  // Format amount
  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || amount == "") return "₹ 0.00";
    const num =
      typeof amount == "string"
        ? parseFloat(amount.replace(/[^0-9.-]/g, ""))
        : parseFloat(amount);
    if (isNaN(num)) return "₹ 0.00";
    return `₹ ${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Check if we have any data to display
  const hasData = vendorWiseData.length > 0;

  // Print Report Content
  const PrintReportContent = () => {
    const styles = {
      page: {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
      },
      header: {
        textAlign: "center",
        marginBottom: "8px",
        borderBottom: "2px solid #333",
        paddingBottom: "8px",
      },
      title: {
        fontSize: "18px",
        fontWeight: "bold",
        margin: "5px 0",
        color: "#000000",
      },
      vendorInfo: {
        margin: "0 0 8px 0",
        padding: "8px 10px",
        backgroundColor: "#ffffff",
        borderLeft: "4px solid #333",
      },
      section: {
        margin: "0",
        padding: "0",
        pageBreakInside: "avoid",
      },
      sectionTitle: {
        backgroundColor: "#FFCDD2",
        padding: "8px 12px",
        margin: "0",
        fontWeight: "600",
        borderLeft: "none",
        fontSize: "14px",
        color: "#B71C1C",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "0",
        fontSize: "10px",
        tableLayout: "fixed",
      },
      th: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #cbd5e0",
        textAlign: "left",
      },
      thRight: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #cbd5e0",
        textAlign: "right",
      },
      td: {
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textRight: {
        textAlign: "right",
      },
      textBold: { fontWeight: "600" },
      totalRow: {
        backgroundColor: "#fef3c7",
        fontWeight: "600",
      },
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <div>Generated: {reportInfo.generated_date}</div>
          <div style={{ fontSize: "10px", marginTop: "5px", color: "#666" }}>
            Print Time: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Vendor Info */}
        {appliedVendor && (
          <div style={styles.vendorInfo}>
            <strong>Vendor:</strong> {getAppliedVendorDisplay()}
          </div>
        )}

        {/* Date Filters Info */}
        {(appliedFromDate || appliedToDate) && (
          <div
            style={{
              ...styles.vendorInfo,
              backgroundColor: "#f3f4f6",
              borderLeftColor: "#6b7280",
              marginBottom: "8px",
            }}
          >
            <strong>Filters Applied:</strong>
            {appliedFromDate && (
              <span> From: {formatDate(appliedFromDate)}</span>
            )}
            {appliedToDate && <span> To: {formatDate(appliedToDate)}</span>}
          </div>
        )}

        {/* Vendor-wise Data */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thLeft}>Vendor Name</th>
                <th style={styles.thLeft}>Tender No</th>
                <th style={styles.thLeft}>Tender Type</th>
                <th style={styles.thLeft}>Tender Date</th>
                <th style={styles.thRight}>Tender Proposed Amount</th>
                <th style={styles.thLeft}>Work Order No</th>
                <th style={styles.thLeft}>Work Order Date</th>
                <th style={styles.thRight}>Work Order Amount</th>
                <th style={styles.thRight}>Total Work Orders</th>
              </tr>
            </thead>
            <tbody>
              {vendorWiseData.map((vendor, vendorIdx) => 
                (vendor.tenders || []).map((tender, tenderIdx) => (
                  <tr key={`print-tender-${tender.tender_id}-${tenderIdx}`}>
                    <td style={styles.tdLeft}>
                      {vendor.vendor_name}
                      {vendor.vendor_code && (
                        <div style={{ fontSize: "9px", color: "#666" }}>
                          ({vendor.vendor_code})
                        </div>
                      )}
                    </td>
                    <td style={styles.tdLeft}>{tender.tender_no || "-"}</td>
                    <td style={styles.tdLeft}>{tender.tender_type || "-"}</td>
                    <td style={styles.tdLeft}>
                      {formatDate(tender.tender_date)}
                    </td>
                    <td style={styles.tdRight}>
                      {formatAmount(tender.tender_proposed_amount)}
                    </td>
                    <td style={styles.tdLeft}>{tender.work_order_no || "-"}</td>
                    <td style={styles.tdLeft}>
                      {formatDate(tender.work_order_date)}
                    </td>
                    <td style={styles.tdRight}>
                      {formatAmount(tender.work_order_amount)}
                    </td>
                    <td style={styles.tdRight}>
                      {formatAmount(vendor.total_work_orders)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {summary && (
              <tfoot>
                <tr style={{ backgroundColor: "#ffffff", fontWeight: "bold" }}>
                  <td style={styles.tdLeft}></td>
                  <td style={styles.tdLeft} colSpan={3}>GRAND TOTAL</td>
                  <td style={styles.tdRight}>
                    {formatAmount(summary.total_tender_proposed)}
                  </td>
                  <td style={styles.tdLeft} colSpan={2}></td>
                  <td style={styles.tdRight}>
                    {formatAmount(summary.total_work_order_amount)}
                  </td>
                  <td style={styles.tdRight}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Grand Summary */}
        {summary && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px 12px",
              backgroundColor: "#ffffff",
              borderTop: "2px solid #333",
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: "12px",
              color: "#000000",
            }}
          >
            <span>GRAND TOTAL</span>
            <div>
              <span>
                Total Tender Proposed:{" "}
                {formatAmount(summary.total_tender_proposed)}
              </span>
              <span style={{ marginLeft: "20px" }}>
                Total Work Order Amount:{" "}
                {formatAmount(summary.total_work_order_amount)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render filters section with vendor dropdown
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <SearchableDropdown
              label="Vendor"
              value={selectedVendor}
              error={null}
              required={false}
              icon={FiUser}
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
              loading={dropdownLoading}
              placeholder="Select Vendor"
              searchPlaceholder="Search by vendor name or code..."
              buttonRef={vendorButtonRef}
              dropdownRef={vendorDropdownRef}
              searchRef={vendorSearchRef}
              itemRefs={vendorItemRefs}
              listRef={vendorListRef}
              getId={(item) => (item.Vendor_id || item.id)?.toString()}
              renderItem={renderVendorItem}
              includeAllOption={true}
              allOptionLabel="All Vendors"
              allOptionValue="all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
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
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <div className="relative">
              <FiFileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={`${sortBy}|${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("|");
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                  if (hasGenerated) invalidateReport();
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="work_order_amount|desc">
                  Work Order Amount (High to Low)
                </option>
                <option value="work_order_amount|asc">
                  Work Order Amount (Low to High)
                </option>
                <option value="tender_proposed_amount|desc">
                  Tender Proposed Amount (High to Low)
                </option>
                <option value="tender_proposed_amount|asc">
                  Tender Proposed Amount (Low to High)
                </option>
                <option value="tender_date|desc">
                  Tender Date (Newest First)
                </option>
                <option value="tender_date|asc">
                  Tender Date (Oldest First)
                </option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading || dropdownLoading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
              title="Generate Report"
            >
              <FiCheck className="h-4 w-4 mr-2" />
              Generate Report
            </button>

            {(hasGenerated ||
              appliedVendor ||
              appliedFromDate ||
              appliedToDate) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <FiX className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
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
      <p className="mt-2 text-gray-500">Loading vendor-wise report...</p>
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
          Select <strong>Vendor</strong> and filters, then click{" "}
          <span className="font-medium">Generate Report</span>.
        </p>
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Vendor Data Found
        </h3>
        <p className="text-gray-600 mb-4">
          {appliedVendor && appliedVendor != "all"
            ? "No tender data available for the selected vendor."
            : appliedVendor == "all"
              ? "No tender data available for any vendor."
              : "No tender data available."}
        </p>
        {appliedVendor && appliedVendor != "all" && appliedVendorData && (
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg inline-block mx-auto">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Selected Vendor:</span>{" "}
              {getAppliedVendorDisplay()}
            </p>
          </div>
        )}
        {appliedVendor && (
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <FiX className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        )}
      </div>
    );

  const handleExcelExport = () => {
    const rows = [];
    vendorWiseData.forEach((vendor) => {
      (vendor.tenders || []).forEach((tender) => {
        rows.push({
          Vendor: vendor.vendor_name || "",
          "Vendor Code": vendor.vendor_code || "",
          "Tender No": tender.tender_no || "",
          "Tender Type": tender.tender_type || "",
          "Tender Date": formatDate(tender.tender_date),
          "Tender Proposed Amount": tender.tender_proposed_amount || 0,
          "Work Order No": tender.work_order_no || "",
          "Work Order Date": formatDate(tender.work_order_date),
          "Work Order Amount": tender.work_order_amount || 0,
          "Vendor Total WO": vendor.total_work_orders || 0,
        });
      });
    });
    if (summary) {
      rows.push({
        Vendor: "GRAND TOTAL",
        "Vendor Code": "",
        "Tender No": "",
        "Tender Type": "",
        "Tender Date": "",
        "Tender Proposed Amount": summary.total_tender_proposed || 0,
        "Work Order No": "",
        "Work Order Date": "",
        "Work Order Amount": summary.total_work_order_amount || 0,
        "Vendor Total WO": "",
      });
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendorwise Register");
    XLSX.writeFile(wb, `VendorwiseRegister.xlsx`);
  };

  // Render data table
  const renderDataTable = () => {
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Vendor Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Tender No
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Tender Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Tender Date
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
                <th className="px-4 py-3 text-right text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300 border-r border-gray-300">
                  Work Order Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-black uppercase tracking-wider border-b border-gray-300">
                  Total Work Orders
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {vendorWiseData.map((vendor, vendorIdx) => (
                <React.Fragment key={`vendor-${vendor.vendor_id}-${vendorIdx}`}>
                  {(vendor.tenders || []).map((tender, tenderIdx) => (
                    <tr
                      key={`tender-${tender.tender_id}-${tenderIdx}`}
                      className="border-b border-gray-300"
                    >
                      <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                        {vendor.vendor_name}
                        {vendor.vendor_code && (
                          <div className="text-xs text-gray-600">
                            ({vendor.vendor_code})
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                        {tender.tender_no || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                        {tender.tender_type || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                        {formatDate(tender.tender_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-black border-r border-gray-300">
                        {formatAmount(tender.tender_proposed_amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                        {tender.work_order_no || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-black border-r border-gray-300">
                        {formatDate(tender.work_order_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-black border-r border-gray-300">
                        {formatAmount(tender.work_order_amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-black">
                        {formatAmount(vendor.total_work_orders)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
            {summary && (
              <tfoot>
                <tr className="bg-white font-bold text-black border-t-2 border-gray-300">
                  <td className="px-4 py-3 text-sm border-r border-gray-300"></td>
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-sm border-r border-gray-300"
                  >
                    GRAND TOTAL
                  </td>
                  <td className="px-4 py-3 text-sm text-right border-r border-gray-300">
                    {formatAmount(summary.total_tender_proposed)}
                  </td>
                  <td
                    colSpan={2}
                    className="px-4 py-3 border-r border-gray-300"
                  ></td>
                  <td className="px-4 py-3 text-sm text-right border-r border-gray-300">
                    {formatAmount(summary.total_work_order_amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

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
              onClick={handleExcelExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
              title="Export to Excel"
            >
              <RiFileExcel2Line className="h-4 w-4 mr-2" />
              Excel
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
          {/* Header with title */}
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

export default VendorwiseReg;
