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

const IncomeExpenditure = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dateRange, setDateRange] = useState({ from_date: "", to_date: "" });
  const [hasGenerated, setHasGenerated] = useState(false);
  const [pageTitle, setPageTitle] = useState("Profit & Loss Statement");

  // Date filters (UI)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Applied date filters
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

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
      const currentPath = "/reports/finance/income-expenditure";
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

  // Set default date range (current month to today)
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setFromDate(formatDate(firstDayOfMonth));
    setToDate(formatDate(today));
  }, []);

  // Fetch Profit & Loss data
  const fetchData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const params = {};
      if (appliedFromDate) params.from_date = appliedFromDate;
      if (appliedToDate) params.to_date = appliedToDate;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/profit-loss`,
        {
          params,
          headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` }
        },
      );

      if (response.data?.success) {
        const data = response.data.data || {};
        setIncomeData(data.income || []);
        setExpenseData(data.expenses || []);
        setSummary(data.summary || null);
        setDateRange({
          from_date: data.from_date || appliedFromDate,
          to_date: data.to_date || appliedToDate,
        });

        setMessage({ text: "Data loaded successfully", type: "success" });
      } else {
        setIncomeData([]);
        setExpenseData([]);
        setSummary(null);
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      console.error("Error fetching profit & loss data:", err);
      setIncomeData([]);
      setExpenseData([]);
      setSummary(null);
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
    setIncomeData([]);
    setExpenseData([]);
    setSummary(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    setFromDate(formatDate(firstDayOfMonth));
    setToDate(formatDate(today));
    setAppliedFromDate("");
    setAppliedToDate("");
    invalidateReport();
  };

  const applyFilters = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setHasGenerated(true);
  };

  const handleGenerateReport = async () => {
    applyFilters();
    await fetchData();
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
    return `₹ ${formatted}`;
  };

  const formatAmountRaw = (amount) => {
    if (amount == undefined || amount == null || amount == "") return "-";
    const num = parseFloat(amount);
    if (isNaN(num)) return "-";
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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

  const hasData = incomeData.length > 0 || expenseData.length > 0;

  const handleExcelExport = () => {
    const rows = [];
    rows.push({
      Code: "INCOME",
      "GIFI Code": "",
      "Amount (₹)": "",
      "Total Amount (₹)": "",
    });
    incomeData.forEach((item) => {
      const isLeaf = item.GroupStatus == "3";
      const absAmt = Math.abs(parseFloat(item.Balance) || 0);
      rows.push({
        Code: item.GroupCode,
        "GIFI Code": `[${item.GroupCode}] ${item.DisplayName?.trim()}`,
        "Amount (₹)": isLeaf ? absAmt : "",
        "Total Amount (₹)": !isLeaf ? absAmt : "",
      });
    });
    if (summary)
      rows.push({
        Code: "",
        "GIFI Code": "TOTAL INCOME",
        "Amount (₹)": "",
        "Total Amount (₹)": Math.abs(summary.total_income),
      });

    rows.push({
      Code: "",
      "GIFI Code": "",
      "Amount (₹)": "",
      "Total Amount (₹)": "",
    });
    rows.push({
      Code: "EXPENSES",
      "GIFI Code": "",
      "Amount (₹)": "",
      "Total Amount (₹)": "",
    });
    expenseData.forEach((item) => {
      const isLeaf = item.GroupStatus == "3";
      const absAmt = Math.abs(parseFloat(item.Balance) || 0);
      rows.push({
        Code: item.GroupCode,
        "GIFI Code": `[${item.GroupCode}] ${item.DisplayName?.trim()}`,
        "Amount (₹)": isLeaf ? absAmt : "",
        "Total Amount (₹)": !isLeaf ? absAmt : "",
      });
    });
    if (summary) {
      rows.push({
        Code: "",
        "GIFI Code": "TOTAL EXPENSES",
        "Amount (₹)": "",
        "Total Amount (₹)": Math.abs(summary.total_expenses),
      });
      rows.push({
        Code: "",
        "GIFI Code": `NET ${summary.net_type}`,
        "Amount (₹)": "",
        "Total Amount (₹)": Math.abs(summary.net_profit_loss),
      });
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Income Expenditure");
    XLSX.writeFile(wb, `IncomeExpenditure.xlsx`);
  };

  const getIndent = (displayName) => {
    const spaces = (displayName?.match(/^(\s*)/) || ["", ""])[1].length;
    return Math.floor(spaces / 2) * 20;
  };

  const renderTable = () => {
    const renderRow = (item, idx) => {
      const isLeaf = item.GroupStatus == "3";
      const isMain = item.GroupStatus == "1";
      const amt = parseFloat(item.Balance) || 0;
      const absAmt = Math.abs(amt).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const indent = getIndent(item.DisplayName);

      return (
        <tr
          key={`${item.GroupCode}-${idx}`}
          className={isMain ? "bg-gray-50" : "bg-white"}
        >
          <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap w-28">
            {item.GroupCode}
          </td>
          <td
            className="py-2 text-sm"
            style={{ paddingLeft: `${12 + indent}px` }}
          >
            <span
              className={
                isLeaf
                  ? "text-red-500"
                  : isMain
                    ? "text-gray-900 font-bold"
                    : "text-blue-700 font-semibold"
              }
            >
              [{item.GroupCode}] {item.DisplayName?.trim()}
            </span>
          </td>
          <td className="px-3 py-2 text-sm text-right font-mono w-48">
            <span className={isLeaf ? "text-red-500" : ""}>
              {isLeaf ? absAmt : ""}
            </span>
          </td>
          <td className="px-3 py-2 text-sm text-right font-mono w-48">
            <span
              className={
                isMain
                  ? "font-bold text-gray-900"
                  : "text-blue-700 font-semibold"
              }
            >
              {!isLeaf ? absAmt : ""}
            </span>
          </td>
        </tr>
      );
    };

    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-28">
                Code
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                GIFI Code
              </th>
              <th
                className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase w-48"
                colSpan={2}
              >
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* INCOME SECTION */}
            <tr className="bg-gray-200">
              <td
                colSpan={4}
                className="px-3 py-2 text-sm font-bold text-gray-800 uppercase"
              >
                INCOME
              </td>
            </tr>
            {incomeData.map((item, idx) => renderRow(item, idx))}
            {summary && (
              <tr className="bg-gray-100">
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-gray-800">
                  TOTAL INCOME
                </td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm text-right font-mono font-bold">
                  {Math.abs(summary.total_income).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            )}

            {/* EXPENSES SECTION */}
            <tr className="bg-gray-200">
              <td
                colSpan={4}
                className="px-3 py-2 text-sm font-bold text-gray-800 uppercase"
              >
                EXPENSES
              </td>
            </tr>
            {expenseData.map((item, idx) => renderRow(item, idx))}
            {summary && (
              <tr className="bg-gray-100">
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-gray-800">
                  TOTAL EXPENSES
                </td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm text-right font-mono font-bold">
                  {Math.abs(summary.total_expenses).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            )}

            {/* NET PROFIT / LOSS */}
            {summary && (
              <tr className="bg-sky-100">
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-sky-800">
                  NET {summary.net_type == "PROFIT" ? "PROFIT" : "LOSS"}
                </td>
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm text-right font-mono font-bold text-sky-800">
                  {Math.abs(summary.net_profit_loss).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
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
      dateRange: {
        fontSize: "11px",
        color: "#666",
        marginTop: "4px",
      },
      section: {
        marginBottom: "15px",
        pageBreakInside: "auto",
      },
      sectionTitle: {
        backgroundColor: "#FFCDD2",
        padding: "6px 10px",
        fontWeight: "600",
        fontSize: "12px",
        color: "#B71C1C",
        borderBottom: "1px solid #FFCDD2",
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
      textBold: { fontWeight: "600" },
      mainRow: { backgroundColor: "#ffffff", fontWeight: "600" },
      subRow: { backgroundColor: "#f9fafb" },
      summaryRow: {
        backgroundColor: "#e0f2fe",
        fontWeight: "bold",
        borderTop: "2px solid #0284c7",
      },
    };

    const renderPrintTable = (data, title) => {
      if (data.length == 0) return null;
      return (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>{title}</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: "100px" }}>Code</th>
                <th style={styles.th}>GIFI Code</th>
                <th style={styles.thRight}>Amount (₹)</th>
                <th style={styles.thRight}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => {
                const isLeaf = item.GroupStatus == "3";
                const isMain = item.GroupStatus == "1";
                const absAmt = Math.abs(
                  parseFloat(item.Balance) || 0,
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                const rowStyle = isMain
                  ? styles.mainRow
                  : isLeaf
                    ? {}
                    : styles.subRow;
                const indent = getIndent(item.DisplayName);
                return (
                  <tr key={`print-${item.GroupCode}-${idx}`} style={rowStyle}>
                    <td style={styles.td}>{item.GroupCode}</td>
                    <td
                      style={{
                        ...styles.td,
                        paddingLeft: `${8 + indent}px`,
                        color: isLeaf
                          ? "#dc2626"
                          : isMain
                            ? "#111827"
                            : "#C62828",
                        fontWeight: isLeaf ? "normal" : "600",
                      }}
                    >
                      [{item.GroupCode}] {item.DisplayName?.trim()}
                    </td>
                    <td
                      style={{
                        ...styles.tdRight,
                        color: isLeaf ? "#dc2626" : "inherit",
                      }}
                    >
                      {isLeaf ? absAmt : ""}
                    </td>
                    <td
                      style={{
                        ...styles.tdRight,
                        fontWeight: isMain ? "bold" : "600",
                        color: isMain ? "#111827" : "#C62828",
                      }}
                    >
                      {!isLeaf ? absAmt : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          {(appliedFromDate || appliedToDate) && (
            <div style={styles.dateRange}>
              Period: {formatDate(appliedFromDate || dateRange.from_date)} to{" "}
              {formatDate(appliedToDate || dateRange.to_date)}
            </div>
          )}
        </div>

        {renderPrintTable(incomeData, "INCOME")}

        {summary && (
          <div
            style={{
              padding: "6px 10px",
              backgroundColor: "#f0fdf4",
              borderTop: "2px solid #16a34a",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
              fontSize: "11px",
            }}
          >
            <span>TOTAL INCOME</span>
            <span>
              {Math.abs(summary.total_income).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        {renderPrintTable(expenseData, "EXPENSES")}

        {summary && (
          <>
            <div
              style={{
                padding: "6px 10px",
                backgroundColor: "#fef2f2",
                borderTop: "2px solid #dc2626",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "11px",
              }}
            >
              <span>TOTAL EXPENSES</span>
              <span>
                {Math.abs(summary.total_expenses).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div
              style={{
                ...styles.summaryRow,
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
              }}
            >
              <span>
                NET {summary.net_type == "PROFIT" ? "PROFIT" : "LOSS"}
              </span>
              <span>
                {Math.abs(summary.net_profit_loss).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </>
        )}
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
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <FiCheck className="h-4 w-4 mr-2" />
                  Generate Report
                </button>
                {(hasGenerated || appliedFromDate || appliedToDate) && (
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
                Loading Profit & Loss data...
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
                  Select <strong>Date Range</strong> and click{" "}
                  <strong>Generate Report</strong> to view Profit & Loss
                  statement.
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

export default IncomeExpenditure;
