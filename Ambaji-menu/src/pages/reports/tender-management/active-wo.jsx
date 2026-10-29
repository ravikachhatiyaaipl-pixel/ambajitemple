import React, { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiX,
  FiPrinter,
  FiFileText,
} from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const ActiveWorkOrders = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [pageTitle, setPageTitle] = useState("Active Work Orders Report");

  const navigate = useNavigate();

  // Department selection (optional now)
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptSearchQuery, setDeptSearchQuery] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownListRef = useRef(null);

  // Vendor filter - store as object with id and name
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorHighlightedIndex, setVendorHighlightedIndex] = useState(-1);
  const vendorDropdownRef = useRef(null);
  const vendorSearchInputRef = useRef(null);
  const vendorDropdownListRef = useRef(null);

  // Date filter states (UI)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Applied date filters (trigger API)
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  // Amount range filters (UI)
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Applied amount filters (trigger API)
  const [appliedMinAmount, setAppliedMinAmount] = useState("");
  const [appliedMaxAmount, setAppliedMaxAmount] = useState("");

  // Status filter (UI)
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusOptions] = useState([
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "on_hold", label: "On Hold" },
    { value: "cancelled", label: "Cancelled" },
  ]);

  // Applied status filter (trigger API)
  const [appliedStatus, setAppliedStatus] = useState("");

  // Include completed work orders toggle (UI)
  const [includeCompleted, setIncludeCompleted] = useState(false);

  // Applied include completed toggle (trigger API)
  const [appliedIncludeCompleted, setAppliedIncludeCompleted] = useState(false);

  // Report data states
  const [reportName, setReportName] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [filtersApplied, setFiltersApplied] = useState({});
  const [summaryData, setSummaryData] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Print states
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();

  // Get dynamic page title
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/tender-management/active-wo";
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

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
    // Load data on initial mount without department filter
    fetchActiveWorkOrdersReport();
  }, []);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDeptDropdown(false);
        setHighlightedIndex(-1);
      }
      if (
        vendorDropdownRef.current &&
        !vendorDropdownRef.current.contains(event.target)
      ) {
        setShowVendorDropdown(false);
        setVendorHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data when APPLIED filters change
  useEffect(() => {
    fetchActiveWorkOrdersReport();
  }, [
    selectedDept,
    selectedVendor,
    appliedFromDate,
    appliedToDate,
    appliedMinAmount,
    appliedMaxAmount,
    appliedStatus,
    appliedIncludeCompleted,
    currentPage,
  ]);

  // Filter data based on search
  useEffect(() => {
    filterData();
  }, [reportData, searchQuery]);

  // Reset highlighted index when search query changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [deptSearchQuery]);

  useEffect(() => {
    setVendorHighlightedIndex(-1);
  }, [vendorSearchQuery]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownListRef.current) {
      const highlightedElement =
        dropdownListRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  useEffect(() => {
    if (vendorHighlightedIndex >= 0 && vendorDropdownListRef.current) {
      const highlightedElement =
        vendorDropdownListRef.current.children[vendorHighlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [vendorHighlightedIndex]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setMessage({ text: "Failed to load departments", type: "error" });
    }
  };

  const fetchActiveWorkOrdersReport = async () => {
    setLoading(true);
    try {
      const params = {
        ...(selectedDept?.id && { dept_id: selectedDept.id }),
        ...(selectedVendor?.id && { vendor_id: parseInt(selectedVendor.id) }),
        ...(appliedFromDate && { from_date: appliedFromDate }),
        ...(appliedToDate && { to_date: appliedToDate }),
        ...(appliedMinAmount && { min_amount: appliedMinAmount }),
        ...(appliedMaxAmount && { max_amount: appliedMaxAmount }),
        ...(appliedStatus && { status: appliedStatus }),
        ...(appliedIncludeCompleted && {
          include_completed: appliedIncludeCompleted,
        }),
        page: currentPage,
        per_page: itemsPerPage,
      };

      console.log("Fetching with params:", params);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tender-reports/active-work-orders`,
        { params,
          
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        
         },
      );

      if (response.data.success) {
        setReportName(response.data.report_name);
        setReportDate(response.data.report_date);
        setFiltersApplied(response.data.filters_applied || {});
        setSummaryData(response.data.summary);
        setPagination(response.data.pagination);

        // Process the data with only the required fields
        const processedData = response.data.data.map((item) => ({
          id: item.work_order_id,
          workOrderNo: item.work_order_no || "-",
          date: item.formatted_date || "-",
          vendorName: item.vendor_name || "-",
          vendorId: item.vendor_id,
          departmentName: item.department_name || "-",
          amount: item.amount || 0,
          formattedAmount:
            item.formatted_amount || formatCurrency(item.amount || 0),
          billed: item.billed || 0,
          formattedBilled:
            item.formatted_billed || formatCurrency(item.billed || 0),
          balance: item.balance || 0,
          formattedBalance:
            item.formatted_balance || formatCurrency(item.balance || 0),
          status: item.status || "-",
          statusCode: item.status_code || "",
        }));

        setReportData(processedData);
        setFilteredData(processedData);

        // Extract unique vendors from work orders
        const vendorMap = {};
        processedData.forEach((item) => {
          if (item.vendorId && item.vendorName && !vendorMap[item.vendorId]) {
            vendorMap[item.vendorId] = {
              id: item.vendorId,
              name: item.vendorName,
            };
          }
        });
        setVendors(
          Object.values(vendorMap).sort((a, b) => a.name.localeCompare(b.name)),
        );

        setMessage({
          text: `Loaded ${processedData.length} active work orders`,
          type: "success",
        });
      }
    } catch (err) {
      console.error("Error fetching active work orders report:", err);
      setMessage({
        text:
          err.response?.data?.message ||
          "Error loading active work orders report",
        type: "error",
      });
      setReportData([]);
      setFilteredData([]);
      setSummaryData(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // Apply all filters
  const applyFilters = () => {
    console.log("Applying filters:", {
      fromDate,
      toDate,
      minAmount,
      maxAmount,
      selectedStatus,
      includeCompleted,
    });

    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedMinAmount(minAmount);
    setAppliedMaxAmount(maxAmount);
    setAppliedStatus(selectedStatus);
    setAppliedIncludeCompleted(includeCompleted);
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const filterData = () => {
    if (!reportData.length) {
      setFilteredData([]);
      return;
    }

    let filtered = [...reportData];

    // Apply search filter
    const searchLower = searchQuery.toLowerCase().trim();
    if (searchLower) {
      filtered = filtered.filter(
        (item) =>
          item.workOrderNo?.toLowerCase().includes(searchLower) ||
          item.vendorName?.toLowerCase().includes(searchLower) ||
          item.departmentName?.toLowerCase().includes(searchLower) ||
          item.status?.toLowerCase().includes(searchLower),
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "on_hold":
      case "on hold":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Keyboard navigation handlers for department dropdown
  const handleDeptKeyDown = (e) => {
    const filteredDepts = filteredDepartments;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (!showDeptDropdown) {
          setShowDeptDropdown(true);
          setTimeout(() => {
            if (searchInputRef.current) {
              searchInputRef.current.focus();
            }
          }, 100);
        } else if (highlightedIndex >= 0 && filteredDepts[highlightedIndex]) {
          selectDepartment(filteredDepts[highlightedIndex]);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!showDeptDropdown) {
          setShowDeptDropdown(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredDepts.length - 1 ? prev + 1 : prev,
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (showDeptDropdown) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDeptDropdown(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleDeptSearchKeyDown = (e) => {
    const filteredDepts = filteredDepartments;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredDepts[highlightedIndex]) {
          selectDepartment(filteredDepts[highlightedIndex]);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredDepts.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Escape":
        e.preventDefault();
        setShowDeptDropdown(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Keyboard navigation handlers for vendor dropdown
  const handleVendorKeyDown = (e) => {
    const filteredVendors = filteredVendorsList;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (!showVendorDropdown) {
          setShowVendorDropdown(true);
          setTimeout(() => {
            if (vendorSearchInputRef.current) {
              vendorSearchInputRef.current.focus();
            }
          }, 100);
        } else if (
          vendorHighlightedIndex >= 0 &&
          filteredVendors[vendorHighlightedIndex]
        ) {
          selectVendor(filteredVendors[vendorHighlightedIndex]);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!showVendorDropdown) {
          setShowVendorDropdown(true);
        } else {
          setVendorHighlightedIndex((prev) =>
            prev < filteredVendors.length - 1 ? prev + 1 : prev,
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (showVendorDropdown) {
          setVendorHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowVendorDropdown(false);
        setVendorHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleVendorSearchKeyDown = (e) => {
    const filteredVendors = filteredVendorsList;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (
          vendorHighlightedIndex >= 0 &&
          filteredVendors[vendorHighlightedIndex]
        ) {
          selectVendor(filteredVendors[vendorHighlightedIndex]);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        setVendorHighlightedIndex((prev) =>
          prev < filteredVendors.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setVendorHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Escape":
        e.preventDefault();
        setShowVendorDropdown(false);
        setVendorHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const selectDepartment = (dept) => {
    setSelectedDept(
      dept
        ? {
            id: dept.Dpt_id,
            name: dept.Dpt_Name,
            desc: dept.Dpt_Desc,
          }
        : null,
    );
    setShowDeptDropdown(false);
    setDeptSearchQuery("");
    setHighlightedIndex(-1);
    setCurrentPage(1);
  };

  const selectVendor = (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorDropdown(false);
    setVendorSearchQuery("");
    setVendorHighlightedIndex(-1);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleIncludeCompletedChange = (e) => {
    setIncludeCompleted(e.target.checked);
  };

  const resetFilters = () => {
    setSelectedDept(null);
    setSelectedVendor(null);
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    setSelectedStatus("");
    setIncludeCompleted(false);
    setAppliedFromDate("");
    setAppliedToDate("");
    setAppliedMinAmount("");
    setAppliedMaxAmount("");
    setAppliedStatus("");
    setAppliedIncludeCompleted(false);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    if (filteredData.length == 0) {
      setMessage({
        text: "No data to export",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const wb = XLSX.utils.book_new();

      // Summary Sheet
      const summarySheetData = [
        {
          "Report Type": pageTitle,
          Department: selectedDept?.name || "All Departments",
          Vendor: selectedVendor?.name || "All Vendors",
          "Date Range":
            appliedFromDate && appliedToDate
              ? `${appliedFromDate} to ${appliedToDate}`
              : "All",
          "Amount Range":
            appliedMinAmount && appliedMaxAmount
              ? `₹${appliedMinAmount} to ₹${appliedMaxAmount}`
              : "All",
          Status: appliedStatus || "All",
          "Include Completed": appliedIncludeCompleted ? "Yes" : "No",
          "Report Name": reportName,
          "Report Date": reportDate,
          "Report Generated": new Date().toLocaleString(),
        },
        {},
        {
          "Summary Metrics": "Value",
          "Total Work Orders": summaryData?.total_work_orders || 0,
          "Total Amount":
            summaryData?.formatted_total_amount ||
            formatCurrency(summaryData?.total_amount || 0),
          "Total Billed":
            summaryData?.formatted_total_billed ||
            formatCurrency(summaryData?.total_billed || 0),
          "Total Balance":
            summaryData?.formatted_total_balance ||
            formatCurrency(summaryData?.total_balance || 0),
          "Overall Completion": summaryData?.overall_completion_percentage
            ? `${summaryData.overall_completion_percentage}%`
            : "0%",
        },
      ];

      const summaryWs = XLSX.utils.json_to_sheet(summarySheetData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      // Details Sheet with only the required fields
      const detailsData = [
        [
          "Work Order No",
          "Date",
          "Vendor Name",
          "Work Order Total Amount",
          "Billed Amount",
          "Balance Amount",
          "Status",
        ],
      ];

      filteredData.forEach((item) => {
        detailsData.push([
          item.workOrderNo,
          item.date,
          item.vendorName,
          item.formattedAmount,
          item.formattedBilled,
          item.formattedBalance,
          item.status,
        ]);
      });

      // Add summary row
      if (summaryData && filteredData.length > 0) {
        detailsData.push([
          "TOTALS:",
          "",
          "",
          summaryData.formatted_total_amount ||
            formatCurrency(summaryData.total_amount || 0),
          summaryData.formatted_total_billed ||
            formatCurrency(summaryData.total_billed || 0),
          summaryData.formatted_total_balance ||
            formatCurrency(summaryData.total_balance || 0),
          "",
        ]);
      }

      const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);

      // Set column widths
      const colWidths = [
        { wch: 18 }, // Work Order No
        { wch: 12 }, // Date
        { wch: 25 }, // Vendor Name
        { wch: 18 }, // Work Order Total Amount
        { wch: 18 }, // Billed Amount
        { wch: 18 }, // Balance Amount
        { wch: 12 }, // Status
      ];
      detailsWs["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, detailsWs, "Active Work Orders");

      // Generate filename
      const deptName = selectedDept?.name?.replace(/\s+/g, "_") || "All_Depts";
      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const filename = `Active_Work_Orders_${deptName}_${dateStamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      setMessage({
        text: "Excel report downloaded successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error downloading Excel:", error);
      setMessage({
        text: "Error creating Excel file: " + error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const PrintReportContent = () => {
    const styles = {
      section: { marginBottom: "15px", pageBreakInside: "avoid" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "6px 8px",
        margin: "8px 0",
        fontWeight: "600",
        borderLeft: "3px solid #EF5350",
        fontSize: "12px",
        color: "#1f2937",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "6px 0",
        fontSize: "10px",
      },
      th: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #cbd5e0",
        textAlign: "left",
      },
      td: {
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textBold: { fontWeight: "600" },
      textRight: { textAlign: "right" },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Details Table */}
        {filteredData.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              Active Work Orders ({filteredData.length} work orders)
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Work Order No</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Vendor Name</th>
                  <th style={styles.th}>Work Order Total Amount</th>
                  <th style={styles.th}>Billed Amount</th>
                  <th style={styles.th}>Balance Amount</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.workOrderNo}</td>
                    <td style={styles.td}>{item.date}</td>
                    <td style={styles.td}>{item.vendorName}</td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {item.formattedAmount}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {item.formattedBilled}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {item.formattedBalance}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "9px",
                          fontWeight: "600",
                          backgroundColor:
                            item.statusCode == "active"
                              ? "#d1fae5"
                              : item.statusCode == "completed"
                                ? "#FFCDD2"
                                : item.statusCode == "on_hold"
                                  ? "#fef3c7"
                                  : item.statusCode == "cancelled"
                                    ? "#fee2e2"
                                    : "#f3f4f6",
                          color:
                            item.statusCode == "active"
                              ? "#065f46"
                              : item.statusCode == "completed"
                                ? "#B71C1C"
                                : item.statusCode == "on_hold"
                                  ? "#92400e"
                                  : item.statusCode == "cancelled"
                                    ? "#991b1b"
                                    : "#1f2937",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Totals Row */}
                {summaryData && (
                  <tr style={{ backgroundColor: "#f9fafb", fontWeight: "600" }}>
                    <td
                      style={{ ...styles.td, ...styles.textBold }}
                      colSpan="3"
                    >
                      TOTALS:
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {summaryData.formatted_total_amount ||
                        formatCurrency(summaryData.total_amount || 0)}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {summaryData.formatted_total_billed ||
                        formatCurrency(summaryData.total_billed || 0)}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {summaryData.formatted_total_balance ||
                        formatCurrency(summaryData.total_balance || 0)}
                    </td>
                    <td style={styles.td}></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages =
    pagination?.last_page || Math.ceil(filteredData.length / itemsPerPage);

  const filteredDepartments = departments.filter((dept) =>
    dept.Dpt_Name?.toLowerCase().includes(deptSearchQuery.toLowerCase()),
  );

  const filteredVendorsList = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(vendorSearchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title={pageTitle}
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organization}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="px-2 py-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            <FiChevronLeft className="mr-1" />
            Back to Dashboard
          </button>
          <div className="w-24"></div>
        </div>

        {/* Header Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {pageTitle}
              </h2>
              {reportDate && (
                <p className="text-sm text-gray-500 mt-1">
                  Report Date: {reportDate}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPrint(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
                disabled={filteredData.length == 0}
              >
                <FiPrinter className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
                disabled={filteredData.length == 0}
              >
                <FiFileText className="h-4 w-4 mr-2" />
                Excel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Department Selector - Now Optional */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Department
              </label>
              <div
                onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                onKeyDown={handleDeptKeyDown}
                tabIndex={0}
                role="button"
                aria-haspopup="listbox"
                aria-expanded={showDeptDropdown}
                className="w-full border border-gray-300 rounded-md p-3 bg-white cursor-pointer hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {selectedDept ? (
                  <>
                    <div className="font-medium text-gray-900">
                      {selectedDept.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedDept.desc}
                    </div>
                  </>
                ) : (
                  <span className="text-gray-500">All Departments</span>
                )}
              </div>

              {/* Department Dropdown */}
              {showDeptDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden">
                  <div className="p-2 border-b">
                    <div className="flex items-center border rounded-md px-3 py-2">
                      <FiSearch className="h-4 w-4 text-gray-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        className="ml-2 w-full focus:outline-none text-sm"
                        placeholder="Search departments..."
                        value={deptSearchQuery}
                        onChange={(e) => setDeptSearchQuery(e.target.value)}
                        onKeyDown={handleDeptSearchKeyDown}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div
                    ref={dropdownListRef}
                    className="overflow-y-auto max-h-64"
                    role="listbox"
                  >
                    <div
                      onClick={() => selectDepartment(null)}
                      onMouseEnter={() => setHighlightedIndex(-1)}
                      className="p-3 cursor-pointer border-b hover:bg-blue-50 transition-colors"
                      role="option"
                    >
                      <span className="text-gray-700">All Departments</span>
                    </div>
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((dept, index) => (
                        <div
                          key={dept.Dpt_id}
                          onClick={() => selectDepartment(dept)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                            highlightedIndex == index
                              ? "bg-blue-100"
                              : "hover:bg-blue-50"
                          }`}
                          role="option"
                          aria-selected={highlightedIndex == index}
                        >
                          <div className="font-medium text-gray-900">
                            {dept.Dpt_Name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {dept.Dpt_Desc}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No departments found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Vendor Filter */}
            <div className="relative" ref={vendorDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Vendor
              </label>
              <div
                onClick={() => setShowVendorDropdown(!showVendorDropdown)}
                onKeyDown={handleVendorKeyDown}
                tabIndex={0}
                role="button"
                aria-haspopup="listbox"
                aria-expanded={showVendorDropdown}
                className="w-full border border-gray-300 rounded-md p-3 bg-white cursor-pointer hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {selectedVendor ? (
                  <span className="text-gray-900">{selectedVendor.name}</span>
                ) : (
                  <span className="text-gray-500">All Vendors</span>
                )}
              </div>

              {/* Vendor Dropdown */}
              {showVendorDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden">
                  <div className="p-2 border-b">
                    <div className="flex items-center border rounded-md px-3 py-2">
                      <FiSearch className="h-4 w-4 text-gray-400" />
                      <input
                        ref={vendorSearchInputRef}
                        type="text"
                        className="ml-2 w-full focus:outline-none text-sm"
                        placeholder="Search vendors..."
                        value={vendorSearchQuery}
                        onChange={(e) => setVendorSearchQuery(e.target.value)}
                        onKeyDown={handleVendorSearchKeyDown}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div
                    ref={vendorDropdownListRef}
                    className="overflow-y-auto max-h-64"
                    role="listbox"
                  >
                    <div
                      onClick={() => selectVendor(null)}
                      onMouseEnter={() => setVendorHighlightedIndex(-1)}
                      className="p-3 cursor-pointer border-b hover:bg-blue-50 transition-colors"
                      role="option"
                    >
                      <span className="text-gray-700">All Vendors</span>
                    </div>
                    {filteredVendorsList.length > 0 ? (
                      filteredVendorsList.map((vendor, index) => (
                        <div
                          key={vendor.id}
                          onClick={() => selectVendor(vendor)}
                          onMouseEnter={() => setVendorHighlightedIndex(index)}
                          className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                            vendorHighlightedIndex == index
                              ? "bg-blue-100"
                              : "hover:bg-blue-50"
                          }`}
                          role="option"
                          aria-selected={vendorHighlightedIndex == index}
                        >
                          <span className="text-gray-900">{vendor.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No vendors found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date Range Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* Amount Range Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Amount (₹)
              </label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="Min amount"
                className="w-full border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Amount (₹)
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="Max amount"
                className="w-full border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
                min="0"
                step="1000"
              />
            </div>

            {/* Apply Filters Button - Full width */}
            <div className="lg:col-span-3 xl:col-span-4 flex justify-end items-end pb-3">
              <button
                onClick={applyFilters}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center font-medium"
                disabled={loading}
              >
                <FiSearch className="mr-2" />
                Apply Filters
              </button>
            </div>
          </div>

          {/* Reset Filters Button */}
          {(selectedDept ||
            selectedVendor ||
            fromDate ||
            toDate ||
            minAmount ||
            maxAmount ||
            selectedStatus ||
            includeCompleted ||
            appliedFromDate ||
            appliedToDate ||
            appliedMinAmount ||
            appliedMaxAmount ||
            appliedStatus ||
            appliedIncludeCompleted) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Main Table Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Work Orders: {filteredData.length}
              </div>
              {selectedDept && (
                <div className="text-sm text-gray-600">
                  Dept: {selectedDept.name}
                </div>
              )}
              {selectedVendor && (
                <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                  Vendor: {selectedVendor.name}
                </div>
              )}
              {(appliedFromDate || appliedToDate) && (
                <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                  Date: {appliedFromDate || "..."} to {appliedToDate || "..."}
                </div>
              )}
              {(appliedMinAmount || appliedMaxAmount) && (
                <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                  Amount: ₹{appliedMinAmount || "0"} - ₹
                  {appliedMaxAmount || "∞"}
                </div>
              )}
              {appliedStatus && (
                <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                  Status:{" "}
                  {statusOptions.find((o) => o.value == appliedStatus)?.label ||
                    appliedStatus}
                </div>
              )}
              {appliedIncludeCompleted && (
                <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                  Including Completed
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <div className="border bg-white rounded-md flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <FiSearch className="h-4 w-4 text-gray-400" />
                <input
                  className="border-0 focus:outline-none text-sm w-full px-2 py-1 bg-transparent"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Simple Table with only the required fields */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <th className="p-3 border border-gray-200">Work Order No</th>
                  <th className="p-3 border border-gray-200">Date</th>
                  <th className="p-3 border border-gray-200">Vendor Name</th>
                  <th className="p-3 border border-gray-200 text-right">
                    Work Order Total Amount
                  </th>
                  <th className="p-3 border border-gray-200 text-right">
                    Billed Amount
                  </th>
                  <th className="p-3 border border-gray-200 text-right">
                    Balance Amount
                  </th>
                  <th className="p-3 border border-gray-200">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">
                        Loading active work orders...
                      </p>
                    </td>
                  </tr>
                ) : currentItems.length == 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 bg-gray-50">
                      <div className="flex flex-col items-center">
                        <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchQuery
                            ? "No records found matching your search."
                            : "No active work orders found for the selected criteria"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {currentItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="p-3 border border-gray-200 text-sm font-medium">
                          {item.workOrderNo}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {item.date}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {item.vendorName}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right">
                          {item.formattedAmount}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right">
                          {item.formattedBilled}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right">
                          {item.formattedBalance}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {/* Summary Row */}
                    {summaryData && (
                      <tr className="bg-gray-50 font-semibold">
                        <td
                          colSpan="3"
                          className="p-3 border border-gray-200 text-right"
                        >
                          TOTALS:
                        </td>
                        <td className="p-3 border border-gray-200 text-right">
                          {summaryData.formatted_total_amount ||
                            formatCurrency(summaryData.total_amount || 0)}
                        </td>
                        <td className="p-3 border border-gray-200 text-right">
                          {summaryData.formatted_total_billed ||
                            formatCurrency(summaryData.total_billed || 0)}
                        </td>
                        <td className="p-3 border border-gray-200 text-right">
                          {summaryData.formatted_total_balance ||
                            formatCurrency(summaryData.total_balance || 0)}
                        </td>
                        <td className="p-3 border border-gray-200"></td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredData.length)} of{" "}
                {filteredData.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage == 1 || loading}
                  className={`p-2 rounded-md ${
                    currentPage == 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-100"
                  } transition-colors`}
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          currentPage == page
                            ? "bg-blue-600 text-white"
                            : "text-blue-600 hover:bg-blue-100"
                        } transition-colors`}
                        disabled={loading}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage == totalPages || loading}
                  className={`p-2 rounded-md ${
                    currentPage == totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-100"
                  } transition-colors`}
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkOrders;
