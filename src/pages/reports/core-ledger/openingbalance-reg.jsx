import React, { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiX,
  FiPrinter,
  FiFileText,
  FiCalendar,
  FiEye,
} from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const OpeningBalanceReg = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [openingBalanceData, setOpeningBalanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [pageTitle, setPageTitle] = useState("Opening Balance Register");

  // Date range filter state
  const [dateRange, setDateRange] = useState({
    fromDate: "",
    toDate: "",
  });
  const [hasGenerated, setHasGenerated] = useState(false);
  const [appliedDateRange, setAppliedDateRange] = useState({
    fromDate: "",
    toDate: "",
  });

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

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/core-ledger/openingbalance-reg";
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

  const fetchOpeningBalanceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/voucher-detail-report`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      if (response.data?.success) {
        // Filter only OPB type vouchers
        const opbData = response.data.data.filter(
          (voucher) => voucher.voucher_type == "OPB",
        );

        setOpeningBalanceData(opbData);
        setGrandTotals(response.data.grand_totals);

        // setMessage({
        //     text: `Loaded ${opbData.length} opening balance vouchers successfully`,
        //     type: "success",
        // });
      } else {
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
        setOpeningBalanceData([]);
      }
    } catch (err) {
      console.error("Error fetching opening balance data:", err);

      let errorMessage = "Error loading opening balance data";
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
      setOpeningBalanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters when generate is clicked
  const applyFilters = () => {
    if (!openingBalanceData.length) {
      setMessage({
        text: "No data available. Please refresh the page.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    let filtered = [...openingBalanceData];

    // Apply date range filter
    if (appliedDateRange.fromDate || appliedDateRange.toDate) {
      filtered = filtered.filter((voucher) => {
        const voucherDateStr = voucher.voucher_date;
        if (!voucherDateStr) return false;

        const [day, month, year] = voucherDateStr.split("/");
        const voucherDate = `${year}-${month}-${day}`;

        if (appliedDateRange.fromDate && appliedDateRange.toDate) {
          return (
            voucherDate >= appliedDateRange.fromDate &&
            voucherDate <= appliedDateRange.toDate
          );
        } else if (appliedDateRange.fromDate) {
          return voucherDate >= appliedDateRange.fromDate;
        } else if (appliedDateRange.toDate) {
          return voucherDate <= appliedDateRange.toDate;
        }
        return true;
      });
    }

    setFilteredData(filtered);
    setHasGenerated(true);
    setCurrentPage(1);
    setLoading(false);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage({ text: "", type: "" });
    }, 3000);
  };

  const handleGenerateReport = () => {
    if (!openingBalanceData.length) {
      fetchOpeningBalanceData().then(() => {
        setAppliedDateRange(dateRange);
        setTimeout(() => applyFilters(), 100);
      });
    } else {
      setAppliedDateRange(dateRange);
      applyFilters();
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
    if (hasGenerated) {
      setHasGenerated(false);
      setFilteredData([]);
    }
  };

  const clearFilters = () => {
    setDateRange({ fromDate: "", toDate: "" });
    setAppliedDateRange({ fromDate: "", toDate: "" });
    setHasGenerated(false);
    setFilteredData([]);
    setMessage({ text: "", type: "" });
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
              appliedDateRange.fromDate && appliedDateRange.toDate
                ? `${appliedDateRange.fromDate} to ${appliedDateRange.toDate}`
                : appliedDateRange.fromDate
                  ? `From ${appliedDateRange.fromDate}`
                  : appliedDateRange.toDate
                    ? `To ${appliedDateRange.toDate}`
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
            "Voucher No": `${voucher.voucher_id} - ${voucher.details[0]?.Vou_Type || "OPB"}`,
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
        const colWidths = [
          { wch: 18 },
          { wch: 12 },
          { wch: 60 },
          { wch: 15 },
          { wch: 15 },
        ];
        detailsWs["!cols"] = colWidths;
        XLSX.utils.book_append_sheet(wb, detailsWs, "Opening Balance Details");
      } else {
        // Complete report (both summary and details)

        // Summary Sheet
        const summaryData = [
          {
            "Report Type": `${pageTitle}`,
            "Selected Voucher": "All Vouchers",
            "Date Range":
              appliedDateRange.fromDate && appliedDateRange.toDate
                ? `${appliedDateRange.fromDate} to ${appliedDateRange.toDate}`
                : appliedDateRange.fromDate
                  ? `From ${appliedDateRange.fromDate}`
                  : appliedDateRange.toDate
                    ? `To ${appliedDateRange.toDate}`
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
            "Voucher No": `${voucher.voucher_id} - ${voucher.details[0]?.Vou_Type || "OPB"}`,
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

          const voucherTotals = calculateVoucherTotals(voucher.details);
          detailsData.push([
            `Voucher ${voucher.voucher_id} - ${voucher.details[0]?.Vou_Type || "OPB"} TOTAL`,
            "",
            "",
            formatCurrency(voucherTotals.total_dr),
            formatCurrency(voucherTotals.total_cr),
          ]);
          detailsData.push([]);
        });

        detailsData.push([
          "GRAND TOTALS",
          "",
          "",
          formatCurrency(grandTotals.grand_total_dr),
          formatCurrency(grandTotals.grand_total_cr),
        ]);

        const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);
        const colWidths = [
          { wch: 18 },
          { wch: 12 },
          { wch: 60 },
          { wch: 15 },
          { wch: 15 },
        ];
        detailsWs["!cols"] = colWidths;
        XLSX.utils.book_append_sheet(wb, detailsWs, "Opening Balance Details");
      }

      const dateRangeStr =
        appliedDateRange.fromDate && appliedDateRange.toDate
          ? `${appliedDateRange.fromDate}_to_${appliedDateRange.toDate}`
          : appliedDateRange.fromDate
            ? `from_${appliedDateRange.fromDate}`
            : appliedDateRange.toDate
              ? `to_${appliedDateRange.toDate}`
              : "all_dates";
      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const filename = `Opening_Balance_${dateRangeStr}_${reportType}_${dateStamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      // setMessage({
      //     text: `Excel ${reportType} report downloaded successfully!`,
      //     type: "success",
      // });

      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
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

  // Print Report Content Component with page break handling
  const PrintReportContent = () => {
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
      section: {
        marginBottom: "30px",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "8px 12px",
        margin: "10px 0",
        fontWeight: "600",
        borderLeft: "3px solid #EF5350",
        fontSize: "14px",
        color: "#1f2937",
      },
      tableContainer: {
        width: "100%",
        overflowX: "visible",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "8px 0",
        fontSize: "11px",
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
      textRight: { textAlign: "right" },
      textBold: { fontWeight: "600" },
      debitText: { color: "#dc2626" },
      creditText: { color: "#059669" },
      pageBreak: {
        pageBreakBefore: "always",
        breakBefore: "page",
      },
    };

    // Split vouchers into groups for page breaks
    const vouchersPerPage = 5;
    const voucherGroups = [];
    for (let i = 0; i < filteredData.length; i += vouchersPerPage) {
      voucherGroups.push(filteredData.slice(i, i + vouchersPerPage));
    }

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            {pageTitle}{" "}
            {reportType == "complete"
              ? ""
              : reportType == "summary"
                ? "(Summary)"
                : "(Detailed)"}
          </h1>
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
            Report Type:{" "}
            {reportType == "complete"
              ? "Complete Report"
              : reportType == "summary"
                ? "Summary Report"
                : "Detailed Report"}
          </div>
          {(appliedDateRange.fromDate || appliedDateRange.toDate) && (
            <div style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
              Date Range:{" "}
              {appliedDateRange.fromDate && appliedDateRange.toDate
                ? `${appliedDateRange.fromDate} to ${appliedDateRange.toDate}`
                : appliedDateRange.fromDate
                  ? `From ${appliedDateRange.fromDate}`
                  : `To ${appliedDateRange.toDate}`}
            </div>
          )}
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
            Total Vouchers: {filteredData.length}
          </div>
        </div>

        {(reportType == "complete" || reportType == "detailed") && (
          <>
            {voucherGroups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                style={groupIndex > 0 ? styles.pageBreak : {}}
              >
                {group.map((voucher, voucherIndex) => {
                  const voucherTotals = calculateVoucherTotals(voucher.details);
                  return (
                    <div key={voucher.voucher_id} style={styles.section}>
                      <div style={styles.tableContainer}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.thLeft}>Voucher No / Type</th>
                              <th style={styles.thLeft}>Date</th>
                              <th style={styles.thLeft}>Account Name</th>
                              <th style={styles.thRight}>Debit (₹)</th>
                              <th style={styles.thRight}>Credit (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {voucher.details.map((detail, idx) => (
                              <tr key={idx}>
                                <td style={styles.tdLeft}>
                                  {idx == 0
                                    ? `${detail.Vou_No || voucher.voucher_id} - ${detail.Vou_Type}`
                                    : ""}
                                </td>
                                <td style={styles.tdLeft}>
                                  {idx == 0
                                    ? detail.Vou_Date || voucher.voucher_date
                                    : ""}
                                </td>
                                <td style={styles.tdLeft}>
                                  <div style={{ fontWeight: "500" }}>
                                    {detail.Account_Name}
                                  </div>
                                </td>
                                <td
                                  style={{
                                    ...styles.tdRight,
                                    ...styles.debitText,
                                  }}
                                >
                                  {detail.Dr_Amount
                                    ? `₹ ${formatCurrency(detail.Dr_Amount)}`
                                    : "-"}
                                </td>
                                <td
                                  style={{
                                    ...styles.tdRight,
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
                          <tfoot>
                            <tr
                              style={{
                                backgroundColor: "#f9fafb",
                                fontWeight: "600",
                              }}
                            >
                              <td
                                colSpan="3"
                                style={{ ...styles.tdRight, fontWeight: "600" }}
                              >
                                Voucher Totals:
                              </td>
                              <td
                                style={{
                                  ...styles.tdRight,
                                  ...styles.debitText,
                                  fontWeight: "600",
                                }}
                              >
                                ₹ {formatCurrency(voucherTotals.total_dr)}
                              </td>
                              <td
                                style={{
                                  ...styles.tdRight,
                                  ...styles.creditText,
                                  fontWeight: "600",
                                }}
                              >
                                ₹ {formatCurrency(voucherTotals.total_cr)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}

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
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.thLeft}>Total Vouchers</th>
                      <th style={styles.thRight}>Grand Total Debit</th>
                      <th style={styles.thRight}>Grand Total Credit</th>
                      <th style={styles.thRight}>Grand Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.tdLeft}>{filteredData.length}</td>
                      <td style={{ ...styles.tdRight, ...styles.debitText }}>
                        ₹ {formatCurrency(grandTotals.grand_total_dr)}
                      </td>
                      <td style={{ ...styles.tdRight, ...styles.creditText }}>
                        ₹ {formatCurrency(grandTotals.grand_total_cr)}
                      </td>
                      <td style={{ ...styles.tdRight, ...styles.textBold }}>
                        ₹ {formatCurrency(grandTotals.grand_difference)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>
    );
  };

  // Helper function to get active filter description
  const getActiveFilterDescription = () => {
    if (appliedDateRange.fromDate && appliedDateRange.toDate) {
      return `${appliedDateRange.fromDate} to ${appliedDateRange.toDate}`;
    } else if (appliedDateRange.fromDate) {
      return `From ${appliedDateRange.fromDate}`;
    } else if (appliedDateRange.toDate) {
      return `To ${appliedDateRange.toDate}`;
    }
    return null;
  };

  // Render filters section
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              name="fromDate"
              value={dateRange.fromDate}
              onChange={handleDateChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              name="toDate"
              value={dateRange.toDate}
              onChange={handleDateChange}
              min={dateRange.fromDate}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              title="Generate Report"
            >
              <FiCalendar className="h-4 w-4 mr-2" />
              Generate Report
            </button>

            {(hasGenerated || dateRange.fromDate || dateRange.toDate) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
              >
                <FiX className="h-4 w-4 mr-2" />
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render message alert
  const renderMessage = () => {
    if (!message.text) return null;

    const bgColor =
      message.type == "success"
        ? "bg-green-50 border-green-200 text-green-800"
        : message.type == "error"
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-blue-50 border-blue-200 text-blue-800";

    return (
      <div
        className={`mb-4 p-3 rounded-lg border ${bgColor} flex items-center justify-between`}
      >
        <span>{message.text}</span>
        <button
          onClick={() => setMessage({ text: "", type: "" })}
          className="ml-2"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500">Loading opening balance data...</p>
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
          Select <strong>Date Range</strong>, then click{" "}
          <span className="font-medium">Generate Report</span>.
        </p>
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Opening Balance Data Found
        </h3>
        <p className="text-gray-600 mb-4">
          No opening balance vouchers available for the selected date range.
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
    const hasData = filteredData.length > 0;

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
      <div>
        {/* Stats Bar */}
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full font-medium">
              Total Vouchers: {filteredData.length}
            </div>
            {getActiveFilterDescription() && (
              <div className="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full flex items-center">
                <FiCalendar className="mr-1 h-3 w-3" />
                {getActiveFilterDescription()}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-emerald-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Voucher No / Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Account Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                  Debit (₹)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                  Credit (₹)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((voucher) => {
                const voucherTotals = calculateVoucherTotals(voucher.details);

                return (
                  <React.Fragment key={voucher.voucher_id}>
                    {/* Voucher detail rows */}
                    {voucher.details.map((detail, idx) => (
                      <tr
                        key={`${voucher.voucher_id}_${idx}`}
                        className={`${idx % 2 == 0 ? "bg-white" : "bg-gray-50"} hover:bg-sky-50 transition-colors`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {idx == 0 ? (
                            <div className="font-medium">
                              {detail.Vou_No || voucher.voucher_id} -{" "}
                              {detail.Vou_Type}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {idx == 0
                            ? detail.Vou_Date || voucher.voucher_date
                            : null}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="font-medium">
                            {detail.Account_Name}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-red-600">
                          {detail.Dr_Amount
                            ? `₹ ${formatCurrency(detail.Dr_Amount)}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-green-600">
                          {detail.Cr_Amount
                            ? `₹ ${formatCurrency(detail.Cr_Amount)}`
                            : "-"}
                        </td>
                      </tr>
                    ))}

                    {/* Voucher Total Row */}
                    <tr className="bg-gray-100 hover:bg-gray-200 transition-colors">
                      <td
                        colSpan="3"
                        className="px-4 py-2 text-sm font-semibold text-gray-700"
                      >
                        <span className="flex items-center">
                          <FiEye className="mr-2 h-4 w-4 text-gray-600" />
                          Voucher {voucher.voucher_id} Total:
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold font-mono text-red-600">
                        ₹ {formatCurrency(voucherTotals.total_dr)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold font-mono text-green-600">
                        ₹ {formatCurrency(voucherTotals.total_cr)}
                      </td>
                    </tr>

                    {/* Spacer between vouchers */}
                    {voucher != currentItems[currentItems.length - 1] && (
                      <tr className="h-2">
                        <td colSpan="5" className="p-0"></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>

            {/* Grand Totals Footer */}
            {grandTotals && hasData && (
              <tfoot>
                <tr className="bg-pink-50">
                  <td
                    colSpan="3"
                    className="px-4 py-3 text-sm font-semibold text-rose-700"
                  >
                    GRAND TOTALS:
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                    ₹ {formatCurrency(grandTotals.grand_total_dr)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                    ₹ {formatCurrency(grandTotals.grand_total_cr)}
                  </td>
                </tr>
                <tr className="bg-yellow-50">
                  <td
                    colSpan="3"
                    className="px-4 py-3 text-sm font-semibold text-gray-700"
                  >
                    Grand Difference:
                  </td>
                  <td
                    colSpan="2"
                    className="px-4 py-3 text-sm font-semibold font-mono text-gray-800"
                  >
                    ₹ {formatCurrency(grandTotals.grand_difference)}
                  </td>
                </tr>
              </tfoot>
            )}
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
    );
  };

  const hasData = filteredData.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title={`${pageTitle} ${reportType == "complete" ? "" : reportType == "summary" ? "(Summary)" : "(Detailed)"}`}
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
        {/* Header with back button and print/export */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>

          <div className="flex space-x-2">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="complete">Complete Report</option>
              <option value="summary">Summary Only</option>
              <option value="detailed">Detailed Only</option>
            </select>
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
              title="Print Report"
            >
              <FiPrinter className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
              title="Export to Excel"
            >
              <FiFileText className="h-4 w-4 mr-2" />
              Excel
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

          {/* Message Alert */}
          {renderMessage()}

          {/* Filters */}
          {renderFilters()}

          {/* Loading State */}
          {loading && renderLoading()}

          {/* No Data State */}
          {!loading && !hasData && renderNoData()}

          {/* Data Display */}
          {!loading && hasData && renderDataTable()}
        </div>
      </div>
    </div>
  );
};

export default OpeningBalanceReg;
