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

const LiabilitiesRegister = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [liabilitiesData, setLiabilitiesData] = useState([]);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [reportInfo, setReportInfo] = useState({
    reportName: "LIABILITIES REGISTER SUMMARY",
    asOnDate: "",
    generatedOn: "",
  });

  // Date filters (UI)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Applied date filters
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  // Filter states
  const [hasGenerated, setHasGenerated] = useState(false);

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();

  const [pageTitle, setPageTitle] = useState("Liabilities Register");

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/liabilities-register";
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

  // Set default date range (first day of financial year to today)
  useEffect(() => {
    const today = new Date();
    const financialYearStart = new Date(today.getFullYear(), 3, 1); // April 1st

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setStartDate(formatDate(financialYearStart));
    setEndDate(formatDate(today));
  }, []);

  // Fetch liabilities register data from API
  const fetchLiabilitiesData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const params = {};
      if (appliedStartDate) params.start_date = appliedStartDate;
      if (appliedEndDate) params.end_date = appliedEndDate;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/liabilities-register`,
        { params,
          headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } 
         },
      );

      if (response.data?.success) {
        setLiabilitiesData(response.data.data?.liability_categories || []);
        setTotalLiabilities(response.data.data?.total_liabilities || 0);
        setReportInfo({
          reportName:
            response.data.data?.report_name || "LIABILITIES REGISTER SUMMARY",
          asOnDate: response.data.data?.as_on_date || "",
          generatedOn: response.data.data?.generated_on || "",
        });
        setMessage({ text: "Data loaded successfully", type: "success" });
      } else {
        setLiabilitiesData([]);
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      console.error("Error fetching liabilities register data:", err);
      setLiabilitiesData([]);
      setMessage({
        text:
          err.response?.data?.message ||
          "Error loading liabilities register data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setLiabilitiesData([]);
    setTotalLiabilities(0);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    const today = new Date();
    const financialYearStart = new Date(today.getFullYear(), 3, 1);
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    setStartDate(formatDate(financialYearStart));
    setEndDate(formatDate(today));
    setAppliedStartDate("");
    setAppliedEndDate("");
    invalidateReport();
  };

  const applyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setHasGenerated(true);
  };

  const handleGenerateReport = async () => {
    applyFilters();
    await fetchLiabilitiesData();
  };

  // Get indent level based on level value
  const getIndentLevel = (level) => {
    return (level - 1) * 20;
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
    if (num < 0) {
      return `₹ (${formatted})`;
    }
    return `₹ ${formatted}`;
  };

  const formatAmountRaw = (amount) => {
    if (amount == undefined || amount == null || amount == "") return "-";
    const num = parseFloat(amount);
    if (isNaN(num)) return "-";
    const formatted = Math.abs(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return num < 0 ? `(${formatted})` : formatted;
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

  const hasData = liabilitiesData.length > 0;

  const handleExcelExport = () => {
    const rows = [];

    rows.push({ Category: "LIABILITIES REGISTER", "Amount (₹)": "" });
    rows.push({
      Category: `Period: ${formatDate(appliedStartDate)} to ${formatDate(appliedEndDate)}`,
      "Amount (₹)": "",
    });
    rows.push({ Category: "", "Amount (₹)": "" });

    liabilitiesData.forEach((item) => {
      const indentLevel = getIndentLevel(item.level) / 20;
      const indentStr = "    ".repeat(indentLevel);
      rows.push({
        Category: indentStr + item.category?.trim(),
        "Amount (₹)": formatAmountRaw(item.amount),
      });
    });

    rows.push({ Category: "", "Amount (₹)": "" });
    rows.push({
      Category: "TOTAL LIABILITIES",
      "Amount (₹)": formatAmountRaw(totalLiabilities),
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Liabilities Register");

    ws["!cols"] = [{ wch: 60 }, { wch: 20 }];

    XLSX.writeFile(
      wb,
      `Liabilities_Register_${appliedStartDate}_to_${appliedEndDate}.xlsx`,
    );
  };

  const renderTable = () => {
    const renderRow = (item, idx) => {
      const indentLevel = getIndentLevel(item.level);
      const amount = parseFloat(item.amount) || 0;
      const absAmount = Math.abs(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const isNegative = amount < 0;

      // Level 1: Main category
      if (item.level == 1) {
        return (
          <tr key={idx} className="bg-sky-100 font-bold">
            <td className="px-4 py-2 text-sm font-bold text-sky-800">
              <span
                style={{
                  paddingLeft: `${indentLevel}px`,
                  display: "inline-block",
                }}
              >
                {item.category?.trim()}
              </span>
            </td>
            <td
              className={`px-4 py-2 text-sm text-right font-mono font-bold ${isNegative ? "text-red-600" : "text-sky-800"}`}
            >
              {absAmount}
            </td>
          </tr>
        );
      }

      // Level 2: Sub categories
      if (item.level == 2) {
        return (
          <tr className="bg-white">
            <td className="px-4 py-2 text-sm">
              <span
                style={{
                  paddingLeft: `${indentLevel}px`,
                  display: "inline-block",
                }}
                className="text-blue-700 font-semibold"
              >
                {item.category?.trim()}
              </span>
            </td>
            <td className="px-4 py-2 text-sm text-right font-mono">
              {absAmount}
            </td>
          </tr>
        );
      }

      // Level 3: Sub-sub categories
      if (item.level == 3) {
        return (
          <tr className="bg-white">
            <td className="px-4 py-2 text-sm">
              <span
                style={{
                  paddingLeft: `${indentLevel}px`,
                  display: "inline-block",
                }}
                className="text-red-500"
              >
                {item.category?.trim()}
              </span>
            </td>
            <td className="px-4 py-2 text-sm text-right font-mono text-red-500">
              {absAmount}
            </td>
          </tr>
        );
      }

      // Level 4 and below
      return (
        <tr className="bg-white">
          <td className="px-4 py-1.5 text-sm">
            <span
              style={{
                paddingLeft: `${indentLevel}px`,
                display: "inline-block",
              }}
              className="text-red-500"
            >
              {item.category?.trim()}
            </span>
          </td>
          <td className="px-4 py-1.5 text-sm text-right font-mono text-red-500">
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Liability Category
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {liabilitiesData.map((item, idx) => renderRow(item, idx))}
          </tbody>
          <tfoot className="bg-gray-200">
            <tr className="bg-sky-100 font-bold">
              <td className="px-4 py-3 text-sm font-bold text-sky-800">
                TOTAL LIABILITIES
              </td>
              <td
                className={`px-4 py-3 text-sm text-right font-mono font-bold ${totalLiabilities < 0 ? "text-red-600" : "text-sky-800"}`}
              >
                {Math.abs(totalLiabilities).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  // Print content with hierarchical display - same as on-screen display
  const PrintReportContent = () => {
    const styles = {
      page: {
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        lineHeight: "1.4",
        padding: "20px",
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
      subTitle: {
        fontSize: "12px",
        color: "#666",
        marginTop: "4px",
      },
      dateRange: {
        fontSize: "11px",
        color: "#666",
        marginTop: "4px",
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
    };

    const renderPrintRow = (item, idx) => {
      const indentLevel = getIndentLevel(item.level);
      const amount = parseFloat(item.amount) || 0;
      const absAmount = Math.abs(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const isNegative = amount < 0;

      // Level 1: Main category
      if (item.level == 1) {
        return (
          <tr
            key={`print-${idx}`}
            style={{ backgroundColor: "#e0f2fe", fontWeight: "bold" }}
          >
            <td
              style={{
                ...styles.td,
                paddingLeft: `${indentLevel + 8}px`,
                color: "#0369a1",
                fontWeight: "bold",
              }}
            >
              {item.category?.trim()}
            </td>
            <td
              style={{
                ...styles.tdRight,
                color: isNegative ? "#dc2626" : "#0369a1",
                fontWeight: "bold",
              }}
            >
              {absAmount}
            </td>
          </tr>
        );
      }

      // Level 2: Sub categories
      if (item.level == 2) {
        return (
          <tr key={`print-${idx}`}>
            <td
              style={{
                ...styles.td,
                paddingLeft: `${indentLevel + 8}px`,
                color: "#C62828",
                fontWeight: "600",
              }}
            >
              {item.category?.trim()}
            </td>
            <td style={styles.tdRight}>{absAmount}</td>
          </tr>
        );
      }

      // Level 3 and below: Red color
      return (
        <tr key={`print-${idx}`}>
          <td
            style={{
              ...styles.td,
              paddingLeft: `${indentLevel + 8}px`,
              color: "#dc2626",
            }}
          >
            {item.category?.trim()}
          </td>
          <td style={{ ...styles.tdRight, color: "#dc2626" }}>{absAmount}</td>
        </tr>
      );
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <div style={styles.subTitle}>{reportInfo.reportName}</div>
          {(appliedStartDate || appliedEndDate) && (
            <div style={styles.dateRange}>
              Period: {formatDate(appliedStartDate)} to{" "}
              {formatDate(appliedEndDate)}
            </div>
          )}
          {reportInfo.generatedOn && (
            <div style={styles.dateRange}>
              Generated On: {reportInfo.generatedOn}
            </div>
          )}
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Liability Category</th>
              <th style={styles.thRight}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {liabilitiesData.map((item, idx) => renderPrintRow(item, idx))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "#e0f2fe", fontWeight: "bold" }}>
              <td
                style={{ ...styles.td, color: "#0369a1", fontWeight: "bold" }}
              >
                TOTAL LIABILITIES
              </td>
              <td
                style={{
                  ...styles.tdRight,
                  color: totalLiabilities < 0 ? "#dc2626" : "#0369a1",
                  fontWeight: "bold",
                }}
              >
                {Math.abs(totalLiabilities).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tfoot>
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

          {/* Filters with Start Date and End Date */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
              <div className="flex gap-3 md:col-span-2">
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
                Loading liabilities register data...
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
                  <strong>End Date</strong> and click{" "}
                  <strong>Generate Report</strong> to view Liabilities Register.
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

export default LiabilitiesRegister;
