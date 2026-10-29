// BalanceSheet.jsx
import React, { useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiCheck,
  FiX,
  FiCalendar,
} from "react-icons/fi";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import axios from "axios";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const BalanceSheet = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [balanceData, setBalanceData] = useState([]);
  const [reportDate, setReportDate] = useState(null);
  const [pageTitle, setPageTitle] = useState("Balance Sheet");

  // Date filters (UI)
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Applied date filters
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  // Filter states
  const [hasGenerated, setHasGenerated] = useState(false);

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
      const currentPath = "/reports/annual-financial/balancesheet";
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

  // Fetch balance sheet data from API
  const fetchBalanceSheetData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const params = {};
      if (appliedFromDate) params.from_date = appliedFromDate;
      if (appliedToDate) params.to_date = appliedToDate;

      const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/balance-sheet`,
          {
            params,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`
            }
          }
        );
      if (response.data?.success) {
        setBalanceData(response.data.data?.records || []);
        setReportDate(response.data.data?.report_date || null);
        setMessage({ text: "Data loaded successfully", type: "success" });
      } else {
        setBalanceData([]);
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      console.error("Error fetching balance sheet data:", err);
      setBalanceData([]);
      setMessage({
        text: err.response?.data?.message || "Error loading balance sheet data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setBalanceData([]);
    setReportDate(null);
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
    await fetchBalanceSheetData();
  };

  // Get hierarchy level based on GroupStatus
  const getIndentLevel = (groupStatus) => {
    const status = parseInt(groupStatus);
    switch (status) {
      case 1:
        return 0; // Main category
      case 2:
        return 1; // Sub category
      case 3:
        return 2; // Sub-sub category
      case 4:
        return 3; // Detailed items
      default:
        return 0;
    }
  };

  // Format amount
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

  const hasData = balanceData.length > 0;

  const handleExcelExport = () => {
    const rows = [];

    // Separate ASSETS and LIABILITIES sections for better Excel organization
    const assetsData = balanceData.filter(
      (item) => item.Section == "ASSETS" || item.Section == "ASSETS_TOTAL",
    );
    const liabilitiesData = balanceData.filter(
      (item) =>
        item.Section == "LIABILITIES" ||
        item.Section == "LIABILITIES_TOTAL" ||
        item.Section == "EQUITY",
    );

    // Assets section
    rows.push({
      "Group Code": "ASSETS",
      "Account Name": "",
      "Balance (₹)": "",
    });
    assetsData.forEach((item) => {
      const indentLevel = getIndentLevel(item.GroupStatus);
      const indentStr = "    ".repeat(indentLevel);
      rows.push({
        "Group Code": item.GroupCode,
        "Account Name": indentStr + item.DisplayName?.trim(),
        "Balance (₹)": formatAmountRaw(item.Balance),
      });
    });

    // Empty row separator
    rows.push({ "Group Code": "", "Account Name": "", "Balance (₹)": "" });

    // Liabilities section
    rows.push({
      "Group Code": "LIABILITIES & EQUITY",
      "Account Name": "",
      "Balance (₹)": "",
    });
    liabilitiesData.forEach((item) => {
      const indentLevel = getIndentLevel(item.GroupStatus);
      const indentStr = "    ".repeat(indentLevel);
      rows.push({
        "Group Code": item.GroupCode,
        "Account Name": indentStr + item.DisplayName?.trim(),
        "Balance (₹)": formatAmountRaw(item.Balance),
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Balance Sheet");

    // Adjust column widths
    ws["!cols"] = [{ wch: 20 }, { wch: 60 }, { wch: 20 }];

    XLSX.writeFile(
      wb,
      `Balance_Sheet_${reportDate || new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const renderTable = () => {
    // Separate data by section
    const assetsData = balanceData.filter(
      (item) => item.Section == "ASSETS" || item.Section == "ASSETS_TOTAL",
    );
    const liabilitiesData = balanceData.filter(
      (item) =>
        item.Section == "LIABILITIES" ||
        item.Section == "LIABILITIES_TOTAL" ||
        item.Section == "EQUITY",
    );

    const renderRow = (item, idx) => {
      const indentLevel = getIndentLevel(item.GroupStatus);
      const isTotal = item.GroupStatus == "0";
      const isLeaf = item.GroupStatus == "3";
      const isMain = item.GroupStatus == "1";
      const amount = parseFloat(item.Balance) || 0;
      const absAmount = Math.abs(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const isNegative = amount < 0;

      // Special styling for TOTAL rows (GroupStatus "0")
      if (isTotal) {
        return (
          <tr className="bg-sky-100 font-bold">
            <td
              className="px-3 py-2 text-sm font-bold text-sky-800"
              colSpan={2}
            >
              <span
                style={{
                  paddingLeft: `${indentLevel * 20}px`,
                  display: "inline-block",
                }}
              >
                {item.DisplayName}
              </span>
            </td>
            <td
              className={`px-3 py-2 text-sm text-right font-mono font-bold ${isNegative ? "text-red-600" : "text-sky-800"}`}
            >
              {absAmount}
            </td>
          </tr>
        );
      }

      // For leaf items (GroupStatus "3" or "4") - show red color like in reference
      if (isLeaf || item.GroupStatus == "4") {
        return (
          <tr className="bg-white">
            <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
              {item.GroupCode}
            </td>
            <td className="px-3 py-2 text-sm">
              <span
                style={{
                  paddingLeft: `${indentLevel * 20}px`,
                  display: "inline-block",
                }}
                className="text-red-500"
              >
                 {item.DisplayName?.trim()}
              </span>
            </td>
            <td className="px-3 py-2 text-sm text-right font-mono text-red-500">
              {absAmount}
            </td>
          </tr>
        );
      }

      // For main/sub category rows - show blue color like in reference
      return (
        <tr className={isMain ? "bg-gray-50" : "bg-white"}>
          <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
            {item.GroupCode}
          </td>
          <td className="px-3 py-2 text-sm">
            <span
              style={{
                paddingLeft: `${indentLevel * 20}px`,
                display: "inline-block",
              }}
              className="text-blue-700 font-semibold"
            >
               {item.DisplayName?.trim()}
            </span>
          </td>
          <td className="px-3 py-2 text-sm text-right font-mono">
            {absAmount}
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
                Account Name
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase w-40">
                Balance (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* ASSETS SECTION */}
            <tr className="bg-gray-200">
              <td
                colSpan={3}
                className="px-3 py-2 text-sm font-bold text-gray-800 uppercase"
              >
                ASSETS
              </td>
            </tr>
            {assetsData.map((item, idx) => renderRow(item, idx))}

            {/* Empty row for spacing */}
            <tr className="bg-white">
              <td colSpan={3} className="py-2"></td>
            </tr>

            {/* LIABILITIES & EQUITY SECTION */}
            <tr className="bg-gray-200">
              <td
                colSpan={3}
                className="px-3 py-2 text-sm font-bold text-gray-800 uppercase"
              >
                LIABILITIES & EQUITY
              </td>
            </tr>
            {liabilitiesData.map((item, idx) => renderRow(item, idx))}
          </tbody>
        </table>
      </div>
    );
  };

  // Print content
  const PrintReportContent = () => {
    const assetsData = balanceData.filter(
      (item) => item.Section == "ASSETS" || item.Section == "ASSETS_TOTAL",
    );
    const liabilitiesData = balanceData.filter(
      (item) =>
        item.Section == "LIABILITIES" ||
        item.Section == "LIABILITIES_TOTAL" ||
        item.Section == "EQUITY",
    );

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
      totalRow: { backgroundColor: "#e0f2fe", fontWeight: "bold" },
    };

    const renderPrintRow = (item, idx) => {
      const indentLevel = getIndentLevel(item.GroupStatus);
      const isTotal = item.GroupStatus == "0";
      const isLeaf = item.GroupStatus == "3";
      const amount = parseFloat(item.Balance) || 0;
      const absAmount = Math.abs(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const isNegative = amount < 0;

      if (isTotal) {
        return (
          <tr key={`print-${item.GroupCode}-${idx}`} style={styles.totalRow}>
            <td
              colSpan={2}
              style={{ ...styles.td, paddingLeft: `${indentLevel * 20 + 8}px` }}
            >
              {item.DisplayName}
            </td>
            <td
              style={{
                ...styles.tdRight,
                color: isNegative ? "#dc2626" : "#0284c7",
              }}
            >
              {absAmount}
            </td>
          </tr>
        );
      }

      if (isLeaf || item.GroupStatus == "4") {
        return (
          <tr key={`print-${item.GroupCode}-${idx}`}>
            <td style={styles.td}>{item.GroupCode}</td>
            <td
              style={{
                ...styles.td,
                paddingLeft: `${indentLevel * 20 + 8}px`,
                color: "#dc2626",
              }}
            >
              {item.DisplayName?.trim()}
            </td>
            <td style={{ ...styles.tdRight, color: "#dc2626" }}>{absAmount}</td>
          </tr>
        );
      }

      return (
        <tr key={`print-${item.GroupCode}-${idx}`}>
          <td style={styles.td}>{item.GroupCode}</td>
          <td
            style={{
              ...styles.td,
              paddingLeft: `${indentLevel * 20 + 8}px`,
              color: "#C62828",
              fontWeight: "600",
            }}
          >
             {item.DisplayName?.trim()}
          </td>
          <td style={styles.tdRight}>{absAmount}</td>
        </tr>
      );
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          {(appliedFromDate || appliedToDate) && (
            <div style={styles.dateRange}>
              Period: {formatDate(appliedFromDate)} to{" "}
              {formatDate(appliedToDate)}
            </div>
          )}
        </div>

        {/* ASSETS SECTION */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>ASSETS</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: "100px" }}>Code</th>
                <th style={styles.th}>Account Name</th>
                <th style={styles.thRight}>Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {assetsData.map((item, idx) => renderPrintRow(item, idx))}
            </tbody>
          </table>
        </div>

        {/* LIABILITIES & EQUITY SECTION */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>LIABILITIES & EQUITY</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: "100px" }}>Code</th>
                <th style={styles.th}>Account Name</th>
                <th style={styles.thRight}>Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {liabilitiesData.map((item, idx) => renderPrintRow(item, idx))}
            </tbody>
          </table>
        </div>
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
                Loading balance sheet data...
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
                  <strong>Generate Report</strong> to view Balance Sheet.
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

export default BalanceSheet;
