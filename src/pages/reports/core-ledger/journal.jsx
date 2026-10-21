import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiAlertCircle,
  FiX,
  FiPrinter,
  FiFileText,
  FiCalendar,
  FiChevronUp,
  FiEye,
} from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const Journal = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [jornalData, setJournalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [pageTitle, setPageTitle] = useState("Journal Register");

  // Date range filter state
  const [dateRange, setDateRange] = useState({
    fromDate: "",
    toDate: "",
  });
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Grand totals from API
  const [grandTotals, setGrandTotals] = useState({
    grand_total_cr: 0,
    grand_total_dr: 0,
    grand_difference: 0,
  });

  const { organization } = useOrganization();

  // Print and Export states
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");
  const [reportType, setReportType] = useState("complete");

  // Add ref to track initial load
  const initialLoadRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/core-ledger/journal";
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

  // Fetch journal data on component mount
  useEffect(() => {
    fetchJournalData();
  }, []);

  // Filter data when search or date range changes
  useEffect(() => {
    filterData();
  }, [jornalData, searchQuery, dateRange]);

  const fetchJournalData = async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/voucher-detail-report`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      if (response.data?.success) {
        // Filter only JOU type vouchers
        const jouData = response.data.data.filter(
          (voucher) => voucher.voucher_type == "JOU",
        );

        setJournalData(jouData);
        setFilteredData(jouData);
        setGrandTotals(response.data.grand_totals);

        setMessage({
          text: `Loaded ${jouData.length} journal vouchers successfully`,
          type: "success",
        });
      } else {
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
        setJournalData([]);
        setFilteredData([]);
      }
    } catch (err) {
      console.error("Error fetching journal data:", err);

      let errorMessage = "Error loading journal data";
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
      setJournalData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const filterData = useCallback(() => {
    if (!jornalData.length) {
      setFilteredData([]);
      return;
    }

    let filtered = [...jornalData];

    // Apply date range filter - Show data BETWEEN fromDate and toDate (inclusive)
    if (dateRange.fromDate || dateRange.toDate) {
      filtered = filtered.filter((voucher) => {
        const voucherDateStr = voucher.voucher_date;

        // If voucher has no date, exclude it when date filter is active
        if (!voucherDateStr) return false;

        // Convert DD/MM/YYYY to YYYY-MM-DD for proper comparison
        const [day, month, year] = voucherDateStr.split("/");
        const voucherDate = `${year}-${month}-${day}`; // Convert to YYYY-MM-DD format

        if (dateRange.fromDate && dateRange.toDate) {
          // Show data between fromDate and toDate (inclusive)
          return (
            voucherDate >= dateRange.fromDate && voucherDate <= dateRange.toDate
          );
        } else if (dateRange.fromDate) {
          // If only from date is selected, show data from that date onwards
          return voucherDate >= dateRange.fromDate;
        } else if (dateRange.toDate) {
          // If only to date is selected, show data up to that date
          return voucherDate <= dateRange.toDate;
        }

        return true;
      });
    }

    // Log for debugging
    console.log("Date Range:", dateRange);
    console.log("Filtered count after date filter:", filtered.length);

    const searchLower = searchQuery.toLowerCase().trim();

    if (!searchLower) {
      setFilteredData(filtered);
      setCurrentPage(1);
      return;
    }

    // Enhanced search through voucher details
    const searchedData = filtered
      .map((voucher) => {
        // Filter the details array to only include matching entries
        const matchingDetails = voucher.details.filter((detail) => {
          // Search in account name
          const matchesAccountName =
            detail.Account_Name?.toLowerCase().includes(searchLower) || false;

          // Search in voucher number with type
          const matchesVoucherNo = `${voucher.voucher_id} - ${detail.Vou_Type}`
            .toLowerCase()
            .includes(searchLower);

          // Search in voucher type
          const matchesVoucherType =
            detail.Vou_Type?.toLowerCase().includes(searchLower) || false;

          // Search in amounts
          const matchesAmount =
            detail.Dr_Amount?.toString().includes(searchLower) ||
            detail.Cr_Amount?.toString().includes(searchLower) ||
            false;

          // Search in date
          const matchesDate =
            detail.Vou_Date?.includes(searchLower) ||
            voucher.voucher_date?.includes(searchLower) ||
            false;

          return (
            matchesAccountName ||
            matchesVoucherNo ||
            matchesVoucherType ||
            matchesAmount ||
            matchesDate
          );
        });

        // If there are matching details, return voucher with only matching details
        if (matchingDetails.length > 0) {
          return {
            ...voucher,
            details: matchingDetails,
          };
        }
        return null;
      })
      .filter((voucher) => voucher != null); // Remove vouchers with no matching details

    setFilteredData(searchedData);
    setCurrentPage(1);
  }, [jornalData, searchQuery, dateRange]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => {
      const newRange = {
        ...prev,
        [name]: value,
      };
      console.log("Date range updated:", newRange);
      return newRange;
    });
    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    setDateRange({
      fromDate: "",
      toDate: "",
    });
    setShowDateFilter(false);
  };

  const formatCurrency = (amount) => {
    if (amount == undefined || amount == null) return "0.00";
    return amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  };

  const calculateVoucherTotals = (details) => {
    const totals = details.reduce(
      (acc, detail) => ({
        total_cr: acc.total_cr + (detail.Cr_Amount || 0),
        total_dr: acc.total_dr + (detail.Dr_Amount || 0),
      }),
      { total_cr: 0, total_dr: 0 },
    );
    totals.difference = totals.total_dr - totals.total_cr;
    return totals;
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

      if (reportType == "summary") {
        // Summary report only
        const summaryData = [
          {
            "Report Type": `${pageTitle} - Summary`,
            "Selected Voucher": "All Vouchers",
            "Date Range":
              dateRange.fromDate && dateRange.toDate
                ? `${dateRange.fromDate} to ${dateRange.toDate}`
                : dateRange.fromDate
                  ? `From ${dateRange.fromDate}`
                  : dateRange.toDate
                    ? `To ${dateRange.toDate}`
                    : "All Dates",
            "Total Vouchers": filteredData.length,
            "Grand Total DR": formatCurrency(grandTotals.grand_total_dr),
            "Grand Total CR": formatCurrency(grandTotals.grand_total_cr),
            "Grand Difference": formatCurrency(grandTotals.grand_difference),
            "Report Generated": new Date().toLocaleString(),
          },
          {},
          { "Voucher-wise Summary": "" },
        ];

        filteredData.forEach((voucher) => {
          const voucherTotals = calculateVoucherTotals(voucher.details);
          summaryData.push({
            "Voucher No": `${voucher.voucher_id} - ${voucher.details[0]?.Vou_Type || "JOU"}`,
            "Voucher Date": voucher.voucher_date,
            "Total Entries": voucher.total_entries,
            "Total DR": formatCurrency(voucherTotals.total_dr),
            "Total CR": formatCurrency(voucherTotals.total_cr),
            Difference: formatCurrency(voucherTotals.difference),
          });
        });

        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
      } else if (reportType == "detailed") {
        // Detailed report only
        const detailsData = [
          [
            "Voucher No",
            "Voucher Date",
            "Account Name",
            "Debit Amount",
            "Credit Amount",
          ],
        ];

        filteredData.forEach((voucher) => {
          voucher.details.forEach((detail) => {
            detailsData.push([
              `${detail.Vou_No || voucher.voucher_id} - ${detail.Vou_Type}`,
              detail.Vou_Date || voucher.voucher_date,
              detail.Account_Name,
              detail.Dr_Amount || 0,
              detail.Cr_Amount || 0,
            ]);
          });
        });

        const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);

        // Set column widths
        const colWidths = [
          { wch: 15 }, // Voucher No
          { wch: 12 }, // Voucher Date
          { wch: 60 }, // Account Name
          { wch: 15 }, // Debit Amount
          { wch: 15 }, // Credit Amount
        ];
        detailsWs["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(wb, detailsWs, "Journal Details");
      } else {
        // Complete report (both summary and details)

        // Summary Sheet
        const summaryData = [
          {
            "Report Type": `${pageTitle} - Complete`,
            "Selected Voucher": "All Vouchers",
            "Date Range":
              dateRange.fromDate && dateRange.toDate
                ? `${dateRange.fromDate} to ${dateRange.toDate}`
                : dateRange.fromDate
                  ? `From ${dateRange.fromDate}`
                  : dateRange.toDate
                    ? `To ${dateRange.toDate}`
                    : "All Dates",
            "Total Vouchers": filteredData.length,
            "Grand Total DR": formatCurrency(grandTotals.grand_total_dr),
            "Grand Total CR": formatCurrency(grandTotals.grand_total_cr),
            "Grand Difference": formatCurrency(grandTotals.grand_difference),
            "Report Generated": new Date().toLocaleString(),
          },
          {},
          { "Voucher-wise Summary": "" },
        ];

        filteredData.forEach((voucher) => {
          const voucherTotals = calculateVoucherTotals(voucher.details);
          summaryData.push({
            "Voucher No": `${voucher.voucher_id} - ${voucher.details[0]?.Vou_Type || "JOU"}`,
            "Voucher Date": voucher.voucher_date,
            "Total Entries": voucher.total_entries,
            "Total DR": formatCurrency(voucherTotals.total_dr),
            "Total CR": formatCurrency(voucherTotals.total_cr),
            Difference: formatCurrency(voucherTotals.difference),
          });
        });

        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

        // Details Sheet
        const detailsData = [
          [
            "Voucher No",
            "Voucher Date",
            "Account Name",
            "Debit Amount",
            "Credit Amount",
          ],
        ];

        filteredData.forEach((voucher) => {
          voucher.details.forEach((detail) => {
            detailsData.push([
              `${detail.Vou_No || voucher.voucher_id} - ${detail.Vou_Type}`,
              detail.Vou_Date || voucher.voucher_date,
              detail.Account_Name,
              detail.Dr_Amount || 0,
              detail.Cr_Amount || 0,
            ]);
          });

          // Add voucher total row
          const voucherTotals = calculateVoucherTotals(voucher.details);
          detailsData.push([
            `Voucher ${voucher.voucher_id} - ${voucher.details[0]?.Vou_Type || "JOU"} TOTAL`,
            "",
            "",
            formatCurrency(voucherTotals.total_dr),
            formatCurrency(voucherTotals.total_cr),
          ]);
          detailsData.push([]); // Empty row for separation
        });

        // Add grand totals
        detailsData.push([
          "GRAND TOTALS",
          "",
          "",
          formatCurrency(grandTotals.grand_total_dr),
          formatCurrency(grandTotals.grand_total_cr),
        ]);

        const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);

        // Set column widths
        const colWidths = [
          { wch: 18 }, // Voucher No (now includes type)
          { wch: 12 }, // Voucher Date
          { wch: 60 }, // Account Name
          { wch: 15 }, // Debit Amount
          { wch: 15 }, // Credit Amount
        ];
        detailsWs["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(wb, detailsWs, "Journal Details");
      }

      // Generate filename with date range info
      const dateRangeStr =
        dateRange.fromDate && dateRange.toDate
          ? `${dateRange.fromDate}_to_${dateRange.toDate}`
          : dateRange.fromDate
            ? `from_${dateRange.fromDate}`
            : dateRange.toDate
              ? `to_${dateRange.toDate}`
              : "all_dates";
      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const filename = `Journal_Register_${dateRangeStr}_${reportType}_${dateStamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      setMessage({
        text: `Excel ${reportType} report downloaded successfully!`,
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
      section: { marginBottom: "20px", pageBreakInside: "avoid" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "8px 12px",
        margin: "10px 0",
        fontWeight: "600",
        borderLeft: "3px solid #EF5350",
        fontSize: "14px",
        color: "#1f2937",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "8px 0",
        fontSize: "11px",
      },
      th: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "8px 10px",
        border: "1px solid #cbd5e0",
        textAlign: "left",
      },
      td: {
        padding: "6px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textRight: { textAlign: "right" },
      textBold: { fontWeight: "600" },
      debitText: { color: "#dc2626" },
      creditText: { color: "#059669" },
    };

    return (
      <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
        {/* Report Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              margin: "0 0 5px 0",
            }}
          >
            {pageTitle}
          </h1>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "0" }}>
            Generated on: {new Date().toLocaleString()}
          </p>
        </div>

        {/* Date Range Info */}
        {(dateRange.fromDate || dateRange.toDate) && (
          <div
            style={{
              marginBottom: "15px",
              padding: "8px 12px",
              backgroundColor: "#f0f9ff",
              borderRadius: "4px",
            }}
          >
            <strong>Date Range: </strong>
            {dateRange.fromDate && dateRange.toDate
              ? `${dateRange.fromDate} to ${dateRange.toDate}`
              : dateRange.fromDate
                ? `From ${dateRange.fromDate}`
                : `To ${dateRange.toDate}`}
          </div>
        )}

        {/* Journal Vouchers */}
        {filteredData.map((voucher) => {
          const voucherTotals = calculateVoucherTotals(voucher.details);
          return (
            <div key={voucher.voucher_id} style={styles.section}>
              {/* Voucher Details - Show for complete and detailed reports */}
              {(reportType == "complete" || reportType == "detailed") && (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Voucher No</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Account Name</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>
                        Debit
                      </th>
                      <th style={{ ...styles.th, textAlign: "right" }}>
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucher.details.map((detail, idx) => (
                      <tr key={idx}>
                        <td style={styles.td}>
                          {/* Show voucher number with type only for first entry */}
                          {idx == 0
                            ? `${detail.Vou_No || voucher.voucher_id} - ${detail.Vou_Type}`
                            : ""}
                        </td>
                        <td style={styles.td}>
                          {/* Show date only for first entry */}
                          {idx == 0
                            ? detail.Vou_Date || voucher.voucher_date
                            : ""}
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: "500" }}>
                            {detail.Account_Name}
                          </div>
                        </td>
                        <td
                          style={{
                            ...styles.td,
                            ...styles.textRight,
                            ...styles.debitText,
                          }}
                        >
                          {detail.Dr_Amount
                            ? `₹ ${formatCurrency(detail.Dr_Amount)}`
                            : "-"}
                        </td>
                        <td
                          style={{
                            ...styles.td,
                            ...styles.textRight,
                            ...styles.creditText,
                          }}
                        >
                          {detail.Cr_Amount
                            ? `₹ ${formatCurrency(detail.Cr_Amount)}`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Add voucher total row at the bottom of details */}
                  {(reportType == "complete" || reportType == "detailed") && (
                    <tfoot>
                      <tr
                        style={{
                          backgroundColor: "#f9fafb",
                          fontWeight: "600",
                        }}
                      >
                        <td
                          colSpan="3"
                          style={{ ...styles.td, textAlign: "right" }}
                        >
                          Voucher Totals:
                        </td>
                        <td
                          style={{
                            ...styles.td,
                            ...styles.textRight,
                            ...styles.debitText,
                          }}
                        >
                          ₹ {formatCurrency(voucherTotals.total_dr)}
                        </td>
                        <td
                          style={{
                            ...styles.td,
                            ...styles.textRight,
                            ...styles.creditText,
                          }}
                        >
                          ₹ {formatCurrency(voucherTotals.total_cr)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              )}
            </div>
          );
        })}

        {/* Grand Totals Section - Only show for complete and summary reports */}
        {(reportType == "complete" || reportType == "summary") &&
          grandTotals && (
            <div style={styles.section}>
              <div
                style={{
                  ...styles.sectionTitle,
                  backgroundColor: "#FFCDD2",
                  borderLeftColor: "#C62828",
                }}
              >
                Grand Totals Summary
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Total Vouchers</th>
                    <th style={styles.th}>Grand Total Debit</th>
                    <th style={styles.th}>Grand Total Credit</th>
                    <th style={styles.th}>Grand Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={styles.td}>{filteredData.length}</td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        ...styles.debitText,
                      }}
                    >
                      ₹ {formatCurrency(grandTotals.grand_total_dr)}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        ...styles.creditText,
                      }}
                    >
                      ₹ {formatCurrency(grandTotals.grand_total_cr)}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        ...styles.textBold,
                      }}
                    >
                      ₹ {formatCurrency(grandTotals.grand_difference)}
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

  // Helper function to get active filter description
  const getActiveFilterDescription = () => {
    if (dateRange.fromDate && dateRange.toDate) {
      return `${dateRange.fromDate} to ${dateRange.toDate}`;
    } else if (dateRange.fromDate) {
      return `From ${dateRange.fromDate}`;
    } else if (dateRange.toDate) {
      return `To ${dateRange.toDate}`;
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title={`${pageTitle} - ${reportType == "complete" ? "Complete" : reportType == "summary" ? "Summary" : "Detailed"}`}
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

        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{pageTitle}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPrint(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
                disabled={filteredData.length == 0}
                title="Print Report"
              >
                <FiPrinter className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
                disabled={filteredData.length == 0}
                title="Export to Excel"
              >
                <FiFileText className="h-4 w-4 mr-2" />
                Excel
              </button>
            </div>
          </div>

          <div className="flex justify-end items-center m-3">
            {(dateRange.fromDate || dateRange.toDate) && (
              <button
                onClick={clearDateFilter}
                className="text-sm text-red-600 hover:text-red-800 flex items-center"
              >
                <FiX className="mr-1" />
                Clear Filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                From Date
              </label>
              <input
                type="date"
                name="fromDate"
                value={dateRange.fromDate}
                onChange={handleDateChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                To Date
              </label>
              <input
                type="date"
                name="toDate"
                value={dateRange.toDate}
                onChange={handleDateChange}
                min={dateRange.fromDate}
                className="w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          {dateRange.fromDate && dateRange.toDate && (
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <FiCalendar className="mr-1" />
              Showing vouchers from {dateRange.fromDate} to {dateRange.toDate}
            </p>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Total Vouchers: {filteredData.length}
              </div>
              {getActiveFilterDescription() && (
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                  <FiCalendar className="mr-1 h-3 w-3" />
                  {getActiveFilterDescription()}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <div className="border bg-white rounded-md flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 transition-all flex-grow min-w-[280px]">
                <FiSearch className="h-4 w-4 text-gray-400" />
                <input
                  className="border-0 focus:outline-none text-sm w-full px-2 py-1 bg-transparent"
                  placeholder="Search by account name, voucher no, type, amount..."
                  disabled={loading}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Journal Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <th className="p-3 border border-gray-200 text-center">
                    Voucher No / Type
                  </th>
                  <th className="p-3 border text-center border-gray-200">
                    Date
                  </th>
                  <th className="p-3 border border-gray-200">Account Name</th>
                  <th className="p-3 border border-gray-200 text-right">
                    Debit
                  </th>
                  <th className="p-3 border border-gray-200 text-right">
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">
                        Loading journal data...
                      </p>
                    </td>
                  </tr>
                ) : currentItems.length == 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 bg-gray-50">
                      <div className="flex flex-col items-center">
                        <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchQuery || dateRange.fromDate || dateRange.toDate
                            ? "No vouchers found matching your criteria."
                            : "No journal data available."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {/* Iterate through each voucher */}
                    {currentItems.map((voucher) => {
                      const voucherTotals = calculateVoucherTotals(
                        voucher.details,
                      );

                      return (
                        <React.Fragment key={voucher.voucher_id}>
                          {/* Voucher detail rows */}
                          {voucher.details.map((detail, idx) => (
                            <tr
                              key={`${voucher.voucher_id}_${idx}`}
                              className="hover:bg-blue-50 transition-colors"
                            >
                              <td className="p-3 border border-gray-200 text-sm text-center font-medium">
                                {idx == 0
                                  ? `${detail.Vou_No || voucher.voucher_id} - ${detail.Vou_Type}`
                                  : ""}
                              </td>
                              <td className="p-3 border text-center border-gray-200 text-sm">
                                {idx == 0
                                  ? detail.Vou_Date || voucher.voucher_date
                                  : ""}
                              </td>
                              <td className="p-3 border border-gray-200 text-sm">
                                <div className="flex flex-col">
                                  <div className="font-medium">
                                    {detail.Account_Name}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 border border-gray-200 text-sm text-right font-medium text-red-600">
                                {detail.Dr_Amount
                                  ? `₹ ${formatCurrency(detail.Dr_Amount)}`
                                  : "-"}
                              </td>
                              <td className="p-3 border border-gray-200 text-sm text-right font-medium text-green-600">
                                {detail.Cr_Amount
                                  ? `₹ ${formatCurrency(detail.Cr_Amount)}`
                                  : "-"}
                              </td>
                            </tr>
                          ))}

                          {/* Voucher Total Row - Shown as the last row of each voucher */}
                          <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                            <td
                              colSpan="3"
                              className="p-3 border border-gray-200 text-right"
                            >
                              <span className="flex items-center justify-end">
                                <FiEye className="mr-2 h-4 w-4 text-gray-600" />
                                Voucher {voucher.voucher_id} Total:
                              </span>
                            </td>
                            <td className="p-3 border border-gray-200 text-right text-red-600 font-bold">
                              ₹ {formatCurrency(voucherTotals.total_dr)}
                            </td>
                            <td className="p-3 border border-gray-200 text-right text-green-600 font-bold">
                              ₹ {formatCurrency(voucherTotals.total_cr)}
                            </td>
                          </tr>

                          {/* Optional: Add a small gap between vouchers */}
                          <tr className="h-2">
                            <td colSpan="5" className="p-0"></td>
                          </tr>
                        </React.Fragment>
                      );
                    })}

                    {/* Grand Totals Row - Only show when available */}
                    {grandTotals && (
                      <>
                        <tr className="bg-blue-50 font-semibold border-t-2 border-blue-300">
                          <td
                            colSpan="3"
                            className="p-3 border border-gray-200 text-right"
                          >
                            GRAND TOTALS:
                          </td>
                          <td className="p-3 border border-gray-200 text-right text-red-600 font-bold">
                            ₹ {formatCurrency(grandTotals.grand_total_dr)}
                          </td>
                          <td className="p-3 border border-gray-200 text-right text-green-600 font-bold">
                            ₹ {formatCurrency(grandTotals.grand_total_cr)}
                          </td>
                        </tr>
                        <tr className="font-semibold bg-yellow-50">
                          <td
                            colSpan="3"
                            className="p-3 border border-gray-200 text-right"
                          >
                            Grand Difference:
                          </td>
                          <td
                            colSpan="2"
                            className="p-3 border border-gray-200 text-left font-bold"
                          >
                            ₹ {formatCurrency(grandTotals.grand_difference)}
                          </td>
                        </tr>
                      </>
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
                {filteredData.length} vouchers
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

export default Journal;
