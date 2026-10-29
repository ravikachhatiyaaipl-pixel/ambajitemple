// TrialDetails.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiAlertCircle,
  FiX,
  FiCalendar,
  FiEye,
  FiChevronUp,
  FiPrinter,
  FiFileText,
  FiRefreshCw,
  FiDownload,
  FiFilter,
} from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const TrialDetails = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [pageTitle, setPageTitle] = useState("Detailed Trial Balance Report");

  // Filter states
  const [selectedGroup, setSelectedGroup] = useState("");
  const [balanceType, setBalanceType] = useState("");
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  const [uniqueGroups, setUniqueGroups] = useState([]);

  // Date filter states
  const [asOnDate, setAsOnDate] = useState("");
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);

  // Financial year states
  const [financialYears, setFinancialYears] = useState([]);
  const [currentFinancialYear, setCurrentFinancialYear] = useState(null);

  // Organisation data
  const [organisationData, setOrganisationData] = useState(null);
  const [selectedOrganisation, setSelectedOrganisation] = useState(null);

  // Print and Export states
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  // Group dropdown ref
  const groupDropdownRef = useRef(null);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  // Add ref to track initial load
  const initialLoadRef = useRef(false);
  const { organization } = useOrganization();

  const isFetchingRef = useRef(false);

  // API Base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/core-ledger/trialdetail";
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

  // Fetch financial years on component mount
  useEffect(() => {
    fetchFinancialYears();
  }, []);

  // Fetch current organisation data
  useEffect(() => {
    fetchCurrentOrganisation();
  }, []);

  // Set initial as on date when component loads
  useEffect(() => {
    if (!initialLoadRef.current) {
      const today = new Date().toISOString().split("T")[0];
      setAsOnDate(today);
      setIsDateFilterActive(true);
      initialLoadRef.current = true;
    }
  }, []);

  // Fetch trial details data when organisation or as on date changes
  useEffect(() => {
    if (selectedOrganisation && asOnDate) {
      const timer = setTimeout(() => {
        fetchTrialDetailsData();
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setReportData(null);
      setFilteredData([]);
    }
  }, [selectedOrganisation, asOnDate]);

  // Filter data when search or filters change
  useEffect(() => {
    filterData();
  }, [reportData, searchQuery, selectedGroup, balanceType, showZeroBalances]);

  // Extract unique groups from data
  useEffect(() => {
    if (reportData?.data) {
      const groups = [
        ...new Set(reportData.data.map((item) => item.ledger_group)),
      ];
      setUniqueGroups(groups.sort());
    }
  }, [reportData]);

  // Handle click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(event.target)
      ) {
        setShowGroupDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchFinancialYears = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/fy-master`,{ headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } });

      if (response.data.success && response.data.data.length > 0) {
        const years = response.data.data;
        setFinancialYears(years);

        // Find current financial year
        const currentFY = years.find((year) => year.is_current_year == true);

        if (currentFY) {
          setCurrentFinancialYear({
            financial_year_id: currentFY.FY_Id,
            financial_year_name: currentFY.FY_Name,
            start_date: currentFY.St_Date,
            end_date: currentFY.Ed_Date,
            is_current_year: currentFY.is_current_year,
            fy_code: currentFY.FY_Code,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching financial years:", err);
    }
  };

  const fetchCurrentOrganisation = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/lst-org-master`,{ headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } });
      if (response.data.success && response.data.data.length > 0) {
        const firstOrg = response.data.data[0];
        const currentOrg = {
          id: firstOrg.Org_Id,
          name: firstOrg.Org_Name,
          code: firstOrg.Org_Code,
        };

        setSelectedOrganisation(currentOrg);
        localStorage.setItem(
          "selectedOrganisation",
          JSON.stringify(currentOrg),
        );
        setOrganisationData({
          name: currentOrg.name,
          id: currentOrg.id,
          code: currentOrg.code,
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching organisation:", err);
      setMessage({ text: "Failed to load organisation", type: "error" });
      setLoading(false);
    }
  };

  const fetchTrialDetailsData = async () => {
    if (!selectedOrganisation || !asOnDate || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        as_on_date: asOnDate,
        org_id: selectedOrganisation.id,
      });

      console.log("Fetching trial details with params:", params.toString());

      const response = await axios.get(
        `${API_BASE_URL}/reports/trial-balance/detailed?${params.toString()}`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      if (response.data?.success) {
        setReportData(response.data);

        // Process the data
        const processedData = response.data.data.map((item) => ({
          ...item,
          opening_debit_num: parseFloat(item.opening_debit) || 0,
          opening_credit_num: parseFloat(item.opening_credit) || 0,
          debit_num: parseFloat(item.debit) || 0,
          credit_num: parseFloat(item.credit) || 0,
          closing_debit_num: parseFloat(item.closing_debit) || 0,
          closing_credit_num: parseFloat(item.closing_credit) || 0,
        }));

        setFilteredData(processedData);
      } else {
        setMessage({
          text: response.data?.message || "No data available for selected date",
          type: "info",
        });
        setReportData(null);
        setFilteredData([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching trial details:", err);

      let errorMessage = "Error loading trial details data";
      if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = err.message;
      }

      setMessage({
        text: errorMessage,
        type: "error",
      });
      setReportData(null);
      setFilteredData([]);
      setLoading(false);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const filterData = useCallback(() => {
    if (!reportData?.data) {
      setFilteredData([]);
      return;
    }

    let filtered = [...reportData.data].map((item) => ({
      ...item,
      opening_debit_num: parseFloat(item.opening_debit) || 0,
      opening_credit_num: parseFloat(item.opening_credit) || 0,
      debit_num: parseFloat(item.debit) || 0,
      credit_num: parseFloat(item.credit) || 0,
      closing_debit_num: parseFloat(item.closing_debit) || 0,
      closing_credit_num: parseFloat(item.closing_credit) || 0,
    }));

    // Apply group filter
    if (selectedGroup) {
      filtered = filtered.filter((item) => item.ledger_group == selectedGroup);
    }

    // Apply balance type filter
    if (balanceType) {
      filtered = filtered.filter((item) => item.balance_type == balanceType);
    }

    // Apply zero balance filter
    if (!showZeroBalances) {
      filtered = filtered.filter(
        (item) => item.closing_debit_num != 0 || item.closing_credit_num != 0,
      );
    }

    // Apply search filter
    const searchLower = searchQuery.toLowerCase().trim();
    if (searchLower) {
      filtered = filtered.filter(
        (item) =>
          (item.ledger_code &&
            item.ledger_code.toLowerCase().includes(searchLower)) ||
          (item.ledger_name &&
            item.ledger_name.toLowerCase().includes(searchLower)) ||
          (item.ledger_group &&
            item.ledger_group.toLowerCase().includes(searchLower)),
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [reportData, searchQuery, selectedGroup, balanceType, showZeroBalances]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGroup("");
    setBalanceType("");
    setShowZeroBalances(false);
  };

  const handleDateChange = (e) => {
    setAsOnDate(e.target.value);
    setIsDateFilterActive(true);
  };

  const resetDateFilter = () => {
    const today = new Date().toISOString().split("T")[0];
    setAsOnDate(today);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Handle financial year selection
  const handleFinancialYearSelect = (year) => {
    if (!year) return;
    setCurrentFinancialYear(year);
  };

  const formatCurrency = (value) => {
    if (value == undefined || value == null || value == "") return "0.00";
    return parseFloat(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate totals from filtered data
  const calculateTotals = () => {
    if (!filteredData.length) {
      return {
        totalOpeningDebit: 0,
        totalOpeningCredit: 0,
        totalClosingDebit: 0,
        totalClosingCredit: 0,
      };
    }

    const totals = filteredData.reduce(
      (acc, item) => ({
        totalOpeningDebit:
          acc.totalOpeningDebit + (item.opening_debit_num || 0),
        totalOpeningCredit:
          acc.totalOpeningCredit + (item.opening_credit_num || 0),
        totalClosingDebit:
          acc.totalClosingDebit + (item.closing_debit_num || 0),
        totalClosingCredit:
          acc.totalClosingCredit + (item.closing_credit_num || 0),
      }),
      {
        totalOpeningDebit: 0,
        totalOpeningCredit: 0,
        totalClosingDebit: 0,
        totalClosingCredit: 0,
      },
    );

    return totals;
  };

  // Excel Export Function
  const exportToExcel = () => {
    if (!selectedOrganisation || filteredData.length == 0) {
      setMessage({
        text: selectedOrganisation
          ? "No data to export"
          : "Organisation not loaded",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const totals = calculateTotals();

      const wb = XLSX.utils.book_new();

      // Summary Sheet
      const summarySheetData = [
        {
          "Report Type": pageTitle,
          Organisation: selectedOrganisation?.name || "N/A",
          "Organisation Code": selectedOrganisation?.code || "N/A",
          "Financial Year":
            currentFinancialYear?.financial_year_name ||
            reportData?.financial_year_code ||
            "N/A",
          "As On Date": asOnDate,
          "Report Generated": new Date().toLocaleString(),
          "Total Ledgers": filteredData.length,
        },
        {},
        {
          "Opening Debit": formatCurrency(totals.totalOpeningDebit),
          "Opening Credit": formatCurrency(totals.totalOpeningCredit),
          "Closing Debit": formatCurrency(totals.totalClosingDebit),
          "Closing Credit": formatCurrency(totals.totalClosingCredit),
          Difference: formatCurrency(
            totals.totalClosingDebit - totals.totalClosingCredit,
          ),
        },
      ];

      const summaryWs = XLSX.utils.json_to_sheet(summarySheetData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      // Details Sheet
      const detailsData = [
        [
          "Code",
          "Ledger Name",
          "Opening Debit",
          "Opening Credit",
          "Closing Debit",
          "Closing Credit",
        ],
      ];

      filteredData.forEach((item) => {
        detailsData.push([
          item.ledger_code || "",
          item.ledger_name || "",
          item.formatted_opening_debit || "0.00",
          item.formatted_opening_credit || "0.00",
          item.formatted_closing_debit || "0.00",
          item.formatted_closing_credit || "0.00",
        ]);
      });

      // Add total row
      detailsData.push([
        "TOTALS",
        "",
        formatCurrency(totals.totalOpeningDebit),
        formatCurrency(totals.totalOpeningCredit),
        formatCurrency(totals.totalClosingDebit),
        formatCurrency(totals.totalClosingCredit),
      ]);

      const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);

      // Set column widths
      const colWidths = [
        { wch: 12 }, // Code
        { wch: 50 }, // Ledger Name
        { wch: 15 }, // Opening Debit
        { wch: 15 }, // Opening Credit
        { wch: 15 }, // Closing Debit
        { wch: 15 }, // Closing Credit
      ];
      detailsWs["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, detailsWs, "Trial Details");

      // Generate filename
      const orgName =
        selectedOrganisation?.name.replace(/\s+/g, "_") || "Organisation";
      const fileName = `Trial_Details_${orgName}_${asOnDate}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setMessage({
        text: "Excel report downloaded successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setMessage({
        text: "Error creating Excel file: " + error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Print Report Content Component
  const PrintReportContent = () => {
    const totals = calculateTotals();

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
      debitText: { color: "#dc2626" },
      creditText: { color: "#059669" },
    };

    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      try {
        return new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch (error) {
        return dateString;
      }
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Report Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Report Summary</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Details</th>
                <th style={styles.th}>Field</th>
                <th style={styles.th}>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Financial Year
                </td>
                <td style={styles.td}>
                  {currentFinancialYear?.financial_year_name ||
                    reportData?.financial_year_code ||
                    "N/A"}
                </td>
                <td style={{ ...styles.td, ...styles.textBold }}>As On Date</td>
                <td style={styles.td}>
                  {reportData?.formatted_as_on_date || formatDate(asOnDate)}
                </td>
              </tr>
              <tr>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Total Ledgers
                </td>
                <td style={styles.td}>{filteredData.length}</td>
                <td style={{ ...styles.td, ...styles.textBold }}>
                  Report Generated
                </td>
                <td style={styles.td}>{new Date().toLocaleString("en-US")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Year Details */}
        {currentFinancialYear && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Financial Year Details</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Field</th>
                  <th style={styles.th}>Details</th>
                  <th style={styles.th}>Field</th>
                  <th style={styles.th}>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>FY Name</td>
                  <td style={styles.td}>
                    {currentFinancialYear.financial_year_name}
                  </td>
                  <td style={{ ...styles.td, ...styles.textBold }}>FY Code</td>
                  <td style={styles.td}>
                    {currentFinancialYear.fy_code || "—"}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...styles.td, ...styles.textBold }}>
                    Start Date
                  </td>
                  <td style={styles.td}>
                    {formatDate(currentFinancialYear.start_date)}
                  </td>
                  <td style={{ ...styles.td, ...styles.textBold }}>End Date</td>
                  <td style={styles.td}>
                    {formatDate(currentFinancialYear.end_date)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Trial Balance Totals */}
        {filteredData.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Trial Balance Totals</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Opening Debit (₹)</th>
                  <th style={styles.th}>Opening Credit (₹)</th>
                  <th style={styles.th}>Closing Debit (₹)</th>
                  <th style={styles.th}>Closing Credit (₹)</th>
                  <th style={styles.th}>Difference (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      ...styles.debitText,
                    }}
                  >
                    {formatCurrency(totals.totalOpeningDebit)}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      ...styles.creditText,
                    }}
                  >
                    {formatCurrency(totals.totalOpeningCredit)}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      ...styles.debitText,
                    }}
                  >
                    {formatCurrency(totals.totalClosingDebit)}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      ...styles.creditText,
                    }}
                  >
                    {formatCurrency(totals.totalClosingCredit)}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      ...styles.textBold,
                    }}
                  >
                    {formatCurrency(
                      totals.totalClosingDebit - totals.totalClosingCredit,
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Ledger Details */}
        {filteredData.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              {pageTitle} - {filteredData.length} entries
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Ledger Name</th>
                  <th style={styles.th}>Opening Debit (₹)</th>
                  <th style={styles.th}>Opening Credit (₹)</th>
                  <th style={styles.th}>Closing Debit (₹)</th>
                  <th style={styles.th}>Closing Credit (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.ledger_id}>
                    <td style={styles.td}>{item.ledger_code || "-"}</td>
                    <td style={styles.td}>
                      <div>
                        {item.ledger_name && (
                          <div style={{ fontWeight: "500" }}>
                            {item.ledger_name}
                          </div>
                        )}
                        {item.ledger_group && (
                          <div
                            style={{
                              fontSize: "9px",
                              color: "#4b5563",
                              marginTop: "2px",
                            }}
                          >
                            Group: {item.ledger_group}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {formatCurrency(item.opening_debit_num)}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {formatCurrency(item.opening_credit_num)}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        ...(item.closing_debit_num > 0 ? styles.debitText : {}),
                      }}
                    >
                      {formatCurrency(item.closing_debit_num)}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        ...(item.closing_credit_num > 0
                          ? styles.creditText
                          : {}),
                      }}
                    >
                      {formatCurrency(item.closing_credit_num)}
                    </td>
                  </tr>
                ))}

                {/* Totals Row */}
                <tr style={{ backgroundColor: "#f9fafb", fontWeight: "600" }}>
                  <td colSpan="2" style={{ ...styles.td, ...styles.textRight }}>
                    TOTALS:
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      ...styles.debitText,
                    }}
                  >
                    {formatCurrency(totals.totalOpeningDebit)}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      ...styles.creditText,
                    }}
                  >
                    {formatCurrency(totals.totalOpeningCredit)}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      ...styles.debitText,
                    }}
                  >
                    {formatCurrency(totals.totalClosingDebit)}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      ...styles.creditText,
                    }}
                  >
                    {formatCurrency(totals.totalClosingCredit)}
                  </td>
                </tr>
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
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totals = calculateTotals();

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
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" />
              Back to Dashboard
            </button>
          </Link>
          <div className="w-24"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{pageTitle}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPrint(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
                disabled={!selectedOrganisation || filteredData.length == 0}
                title="Print Report"
              >
                <FiPrinter className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
                disabled={!selectedOrganisation || filteredData.length == 0}
                title="Export to Excel"
              >
                <FiFileText className="h-4 w-4 mr-2" />
                Excel
              </button>
              <button
                onClick={fetchTrialDetailsData}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center transition-colors"
                disabled={loading}
                title="Refresh Data"
              >
                <FiRefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Organisation and Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Organisation Display */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organisation
              </label>
              <div className="w-full border border-gray-300 rounded-md p-3 bg-gray-50">
                {selectedOrganisation ? (
                  <h3 className="font-medium text-gray-900">
                    {selectedOrganisation.name}
                  </h3>
                ) : (
                  <span className="text-gray-500">Loading...</span>
                )}
              </div>
            </div>

            {/* Financial Year */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Year
              </label>
              <div className="w-full border border-gray-300 rounded-md p-3 bg-gray-50">
                {currentFinancialYear ? (
                  <h3 className="font-medium text-gray-900">
                    {currentFinancialYear.financial_year_name}
                  </h3>
                ) : (
                  <span className="text-gray-500">Loading...</span>
                )}
              </div>
            </div>

            {/* As On Date */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                As On Date
              </label>
              <div className="flex items-center border rounded-md px-3 py-2 text-sm text-gray-700">
                <FiCalendar className="mr-2 h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={asOnDate}
                  onChange={handleDateChange}
                  className="border-0 p-0 focus:outline-none focus:ring-0 w-full"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Code, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors flex items-center"
            >
              <FiFilter className="mr-2 h-4 w-4" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Main Table - Simplified with just ledger_name */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <th className="p-3 border border-gray-200">Code</th>
                  <th className="p-3 border border-gray-200">Ledger Name</th>
                  <th className="p-3 border border-gray-200 text-right">
                    Opening Debit
                  </th>
                  <th className="p-3 border border-gray-200 text-right">
                    Opening Credit
                  </th>
                  <th className="p-3 border border-gray-200 text-right">
                    Closing Debit
                  </th>
                  <th className="p-3 border border-gray-200 text-right">
                    Closing Credit
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">
                        Loading trial balance details...
                      </p>
                    </td>
                  </tr>
                ) : currentItems.length == 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center bg-gray-50"
                    >
                      <div className="flex flex-col items-center">
                        <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchQuery ||
                          selectedGroup ||
                          balanceType ||
                          showZeroBalances
                            ? "No accounts match your filters"
                            : "No trial balance data available for the selected date"}
                        </p>
                        {(searchQuery ||
                          selectedGroup ||
                          balanceType ||
                          showZeroBalances) && (
                          <button
                            onClick={resetFilters}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {currentItems.map((item) => (
                      <tr
                        key={item.ledger_id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="p-3 border border-gray-200 text-sm font-medium">
                          {item.ledger_code || "-"}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {item.ledger_name || "-"}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right">
                          {item.formatted_opening_debit}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right">
                          {item.formatted_opening_credit}
                        </td>
                        <td
                          className={`p-3 border border-gray-200 text-sm text-right font-medium ${
                            parseFloat(item.closing_debit) > 0
                              ? "text-red-600"
                              : ""
                          }`}
                        >
                          {item.formatted_closing_debit}
                        </td>
                        <td
                          className={`p-3 border border-gray-200 text-sm text-right font-medium ${
                            parseFloat(item.closing_credit) > 0
                              ? "text-green-600"
                              : ""
                          }`}
                        >
                          {item.formatted_closing_credit}
                        </td>
                      </tr>
                    ))}

                    {/* Totals Row */}
                    <tr className="bg-gray-50 font-semibold">
                      <td
                        colSpan="2"
                        className="p-3 border border-gray-200 text-right"
                      >
                        TOTALS:
                      </td>
                      <td className="p-3 border border-gray-200 text-right">
                        {formatCurrency(totals.totalOpeningDebit)}
                      </td>
                      <td className="p-3 border border-gray-200 text-right">
                        {formatCurrency(totals.totalOpeningCredit)}
                      </td>
                      <td className="p-3 border border-gray-200 text-right text-red-600">
                        {formatCurrency(totals.totalClosingDebit)}
                      </td>
                      <td className="p-3 border border-gray-200 text-right text-green-600">
                        {formatCurrency(totals.totalClosingCredit)}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredData.length)} of{" "}
                {filteredData.length} ledgers
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
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
                        onClick={() => handlePageClick(page)}
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
                  onClick={handleNextPage}
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

export default TrialDetails;
