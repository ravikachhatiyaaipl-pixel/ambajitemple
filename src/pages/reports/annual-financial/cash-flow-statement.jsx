import React, { useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiCheck,
  FiX,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";
import { BiLoader } from "react-icons/bi";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import axios from "axios";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const CashFlowStatement = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [cashFlowStatements, setCashFlowStatements] = useState([]);
  const [summary, setSummary] = useState([]);
  const [reportInfo, setReportInfo] = useState({
    report_name: "",
    period: { start_date: "", end_date: "" },
    generated_on: "",
  });
  const [hasGenerated, setHasGenerated] = useState(false);
  const [pageTitle, setPageTitle] = useState("Cash Flow Statement");

  // Date filters (UI)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Applied date filters
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

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
      const currentPath = "/reports/finance/cash-flow-statement";
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

  // Set default date range (last month)
  useEffect(() => {
    const today = new Date();
    const firstDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const lastDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
    );

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setStartDate(formatDate(firstDayOfLastMonth));
    setEndDate(formatDate(lastDayOfLastMonth));
  }, []);

  // Fetch Cash Flow Statement data
  const fetchData = async (start = appliedStartDate, end = appliedEndDate) => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const params = {};
      if (start) params.start_date = start;
      if (end) params.end_date = end;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/cash-flow/statement`,
        { params,
         headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } 
         },
      );

      if (response.data?.success) {
        const data = response.data.data || {};
        setCashFlowStatements(data.cash_flow_statements || []);
        setSummary(data.summary || []);
        setReportInfo({
          report_name: data.report_name || pageTitle,
          period: data.period || {
            start_date: appliedStartDate,
            end_date: appliedEndDate,
          },
          generated_on: data.generated_on || new Date().toLocaleString(),
        });
        setMessage({ text: "Data loaded successfully", type: "success" });
      } else {
        setCashFlowStatements([]);
        setSummary([]);
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      console.error("Error fetching cash flow statement data:", err);
      setCashFlowStatements([]);
      setSummary([]);
      setMessage({
        text: err.response?.data?.message || "Error loading data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setCashFlowStatements([]);
    setSummary([]);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    const today = new Date();
    const firstDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const lastDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
    );

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setStartDate(formatDate(firstDayOfLastMonth));
    setEndDate(formatDate(lastDayOfLastMonth));
    setAppliedStartDate("");
    setAppliedEndDate("");
    invalidateReport();
  };

  const handleGenerateReport = async () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setHasGenerated(true);
    await fetchData(startDate, endDate);
  };

  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || amount == "") return "₹ 0.00";
    const num =
      typeof amount == "string"
        ? parseFloat(amount.replace(/,/g, ""))
        : parseFloat(amount);
    if (isNaN(num)) return "₹ 0.00";
    const absNum = Math.abs(num);
    const formatted = absNum.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return num < 0 ? `₹ -${formatted}` : `₹ ${formatted}`;
  };

  const formatAmountRaw = (amount) => {
    if (amount == undefined || amount == null || amount == "") return "-";
    const num = parseFloat(amount);
    if (isNaN(num)) return "-";
    const absNum = Math.abs(num);
    const formatted = absNum.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return num < 0 ? `-${formatted}` : formatted;
  };

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

  const hasData = cashFlowStatements.length > 0;

  const handleExcelExport = () => {
    const rows = [];

    rows.push({ Section: "", Particulars: "", "Amount (₹)": "" });

    cashFlowStatements.forEach((section) => {
      rows.push({
        Section: section.section,
        Particulars: "",
        "Amount (₹)": "",
      });
      section.items.forEach((item) => {
        rows.push({
          Section: "",
          Particulars: item.sub_section,
          "Amount (₹)": formatAmountRaw(item.amount),
        });
      });
      rows.push({ Section: "", Particulars: "", "Amount (₹)": "" });
    });

    rows.push({ Section: "SUMMARY", Particulars: "", "Amount (₹)": "" });
    summary.forEach((item) => {
      rows.push({
        Section: "",
        Particulars: item.category,
        "Amount (₹)": formatAmountRaw(item.amount),
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cash Flow Statement");
    XLSX.writeFile(
      wb,
      `Cash_Flow_Statement_${reportInfo.period.start_date}_to_${reportInfo.period.end_date}.xlsx`,
    );
  };

  const getAmountColorClass = (amount) => {
    if (amount < 0) return "text-red-600";
    return "text-green-600";
  };

  const renderTable = () => {
    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Section / Particulars
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase w-48">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cashFlowStatements.map((section, sectionIdx) => (
              <React.Fragment key={`section-${sectionIdx}`}>
                {/* Section Header */}
                <tr className="bg-blue-50">
                  <td className="px-3 py-2 text-sm font-bold text-blue-800">
                    {section.section}
                  </td>
                  <td className="px-3 py-2 text-sm text-right font-mono font-bold text-blue-800">
                    {section.items[
                      section.items.length - 1
                    ]?.sub_section.includes("Total") ||
                    section.items[
                      section.items.length - 1
                    ]?.sub_section.includes("Net")
                      ? formatAmountRaw(
                          section.items[section.items.length - 1]?.amount,
                        )
                      : ""}
                  </td>
                </tr>

                {/* Section Items */}
                {section.items.map((item, itemIdx) => {
                  const isSubTotal =
                    item.sub_section.includes("Total") ||
                    item.sub_section.includes("Net") ||
                    item.sub_section.includes("Opening") ||
                    item.sub_section.includes("Closing");
                  const isRevenueReceipts =
                    item.sub_section == "Revenue Receipts";
                  const isRevenuePayments =
                    item.sub_section == "Revenue Payments";

                  let rowClass = "bg-white";
                  if (isSubTotal) rowClass = "bg-gray-100";
                  if (isRevenueReceipts) rowClass = "bg-green-50";
                  if (isRevenuePayments) rowClass = "bg-red-50";

                  return (
                    <tr
                      key={`item-${sectionIdx}-${itemIdx}`}
                      className={rowClass}
                    >
                      <td
                        className="px-3 py-2 text-sm"
                        style={{ paddingLeft: `${24}px` }}
                      >
                        <span
                          className={
                            isSubTotal
                              ? "font-semibold text-gray-800"
                              : "text-gray-600"
                          }
                        >
                          {item.sub_section}
                        </span>
                      </td>
                      <td
                        className={`px-3 py-2 text-sm text-right font-mono ${getAmountColorClass(item.amount)} ${isSubTotal ? "font-semibold" : ""}`}
                      >
                        {formatAmountRaw(item.amount)}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}

            {/* Summary Section */}
            {summary.length > 0 && (
              <>
                <tr className="bg-gray-200">
                  <td className="px-3 py-2 text-sm font-bold text-gray-800">
                    SUMMARY
                  </td>
                  <td className="px-3 py-2"></td>
                </tr>
                {summary.map((item, idx) => (
                  <tr
                    key={`summary-${idx}`}
                    className={
                      idx == summary.length - 1 ? "bg-sky-100" : "bg-white"
                    }
                  >
                    <td
                      className="px-3 py-2 text-sm"
                      style={{ paddingLeft: `${24}px` }}
                    >
                      <span
                        className={
                          idx == summary.length - 1
                            ? "font-bold text-sky-800"
                            : "text-gray-700"
                        }
                      >
                        {item.category}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-2 text-sm text-right font-mono ${idx == summary.length - 1 ? "font-bold text-sky-800" : getAmountColorClass(item.amount)}`}
                    >
                      {formatAmountRaw(item.amount)}
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Print content
  const PrintReportContent = () => {
    const styles = {
      page: {
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        lineHeight: "1.4",
      },
      header: {
        textAlign: "center",
        marginBottom: "12px",
        borderBottom: "2px solid #333",
        paddingBottom: "8px",
      },
      title: {
        fontSize: "16px",
        fontWeight: "bold",
        margin: "5px 0",
      },
      period: {
        fontSize: "11px",
        color: "#666",
        marginTop: "4px",
      },
      generatedOn: {
        fontSize: "10px",
        color: "#888",
        marginTop: "2px",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "0",
        fontSize: "10px",
      },
      th: {
        backgroundColor: "#f3f4f6",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #d1d5db",
        textAlign: "left",
      },
      thRight: {
        backgroundColor: "#f3f4f6",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #d1d5db",
        textAlign: "right",
      },
      td: {
        padding: "4px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      tdRight: {
        padding: "4px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
        textAlign: "right",
      },
      sectionHeader: {
        backgroundColor: "#FFCDD2",
        fontWeight: "bold",
        color: "#B71C1C",
      },
      subTotalRow: {
        backgroundColor: "#f3f4f6",
        fontWeight: "600",
      },
      summaryRow: {
        backgroundColor: "#e0f2fe",
        fontWeight: "bold",
      },
    };

    const renderPrintRows = () => {
      return cashFlowStatements.map((section, sectionIdx) => (
        <React.Fragment key={`print-section-${sectionIdx}`}>
          <tr style={styles.sectionHeader}>
            <td style={{ ...styles.td, fontWeight: "bold" }} colSpan={2}>
              {section.section}
            </td>
          </tr>
          {section.items.map((item, itemIdx) => {
            const isSubTotal =
              item.sub_section.includes("Total") ||
              item.sub_section.includes("Net") ||
              item.sub_section.includes("Opening") ||
              item.sub_section.includes("Closing");
            const rowStyle = isSubTotal ? styles.subTotalRow : {};
            const amountColor = item.amount < 0 ? "#dc2626" : "#16a34a";

            return (
              <tr key={`print-item-${sectionIdx}-${itemIdx}`} style={rowStyle}>
                <td style={{ ...styles.td, paddingLeft: "20px" }}>
                  {item.sub_section}
                </td>
                <td
                  style={{
                    ...styles.tdRight,
                    color: amountColor,
                    fontWeight: isSubTotal ? "600" : "normal",
                  }}
                >
                  {formatAmountRaw(item.amount)}
                </td>
              </tr>
            );
          })}
        </React.Fragment>
      ));
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{reportInfo.report_name || pageTitle}</h1>
          {reportInfo.period.start_date && reportInfo.period.end_date && (
            <div style={styles.period}>
              Period: {formatDate(reportInfo.period.start_date)} to{" "}
              {formatDate(reportInfo.period.end_date)}
            </div>
          )}
          {reportInfo.generated_on && (
            <div style={styles.generatedOn}>
              Generated On: {reportInfo.generated_on}
            </div>
          )}
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Particulars</th>
              <th style={styles.thRight}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {renderPrintRows()}

            {/* Summary Section */}
            {summary.length > 0 && (
              <>
                <tr style={styles.sectionHeader}>
                  <td style={{ ...styles.td, fontWeight: "bold" }} colSpan={2}>
                    SUMMARY
                  </td>
                </tr>
                {summary.map((item, idx) => (
                  <tr
                    key={`print-summary-${idx}`}
                    style={idx == summary.length - 1 ? styles.summaryRow : {}}
                  >
                    <td style={{ ...styles.td, paddingLeft: "20px" }}>
                      {item.category}
                    </td>
                    <td
                      style={{
                        ...styles.tdRight,
                        fontWeight:
                          idx == summary.length - 1 ? "bold" : "normal",
                      }}
                    >
                      {formatAmountRaw(item.amount)}
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
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

      <div className="px-2 py-6 max-w-full">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>
          <div className="flex space-x-2">
            <button
              onClick={handleExcelExport}
              disabled={!hasData || loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              title="Export to Excel"
            >
              <RiFileExcel2Line className="h-4 w-4 mr-2" />
              Excel
            </button>
            <button
              onClick={() => setShowPrint(true)}
              disabled={!hasData || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiPrinter className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {pageTitle}
            </h2>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <FiCheck className="h-4 w-4 mr-2" />
                  Generate Report
                </button>
                {(hasGenerated || appliedStartDate || appliedEndDate) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
                  >
                    <FiX className="h-4 w-4 mr-2" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">
                Loading Cash Flow Statement data...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && message.type == "error" && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{message.text}</p>
            </div>
          )}

          {/* No Data State */}
          {!loading &&
            !hasData &&
            message.type != "error" &&
            (!hasGenerated ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Generate report to view results
                </h3>
                <p className="text-gray-600 mb-4">
                  Select <strong>Start Date</strong> and{" "}
                  <strong>End Date</strong>, then click{" "}
                  <strong>Generate Report</strong> to view Cash Flow Statement.
                </p>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  No data available for the selected period.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                >
                  <FiX className="h-4 w-4 mr-2" /> Clear Filters
                </button>
              </div>
            ))}

          {/* Data Display */}
          {!loading && hasData && <>{renderTable()}</>}
        </div>
      </div>
    </div>
  );
};

export default CashFlowStatement;
