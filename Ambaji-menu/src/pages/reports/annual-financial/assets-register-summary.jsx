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

const AssetsRegisterSummary = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [assetCategories, setAssetCategories] = useState([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [reportInfo, setReportInfo] = useState({
    report_name: "",
    as_on_date: "",
    generated_on: "",
  });
  const [hasGenerated, setHasGenerated] = useState(false);
  const [pageTitle, setPageTitle] = useState("Assets Register Summary");

  // Date filter (UI)
  const [asOnDate, setAsOnDate] = useState("");

  // Applied date filter
  const [appliedAsOnDate, setAppliedAsOnDate] = useState("");

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
      const currentPath = "/reports/finance/assets-register-summary";
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

  // Set default as on date (today)
  useEffect(() => {
    const today = new Date();
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    setAsOnDate(formatDate(today));
  }, []);

  // Fetch Asset Register data
  const fetchData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const params = {};
      if (appliedAsOnDate) params.as_on_date = appliedAsOnDate;
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/asset-register`,
        {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`
          }
        }
      );
      if (response.data?.success) {
        const data = response.data.data || {};
        setAssetCategories(data.asset_categories || []);
        setTotalAssets(data.total_assets || 0);
        setReportInfo({
          report_name: data.report_name || pageTitle,
          as_on_date: data.as_on_date || appliedAsOnDate,
          generated_on: data.generated_on || new Date().toLocaleString(),
        });
        setMessage({ text: "Data loaded successfully", type: "success" });
      } else {
        setAssetCategories([]);
        setTotalAssets(0);
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      console.error("Error fetching asset register data:", err);
      setAssetCategories([]);
      setTotalAssets(0);
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
    setAssetCategories([]);
    setTotalAssets(0);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    const today = new Date();
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    setAsOnDate(formatDate(today));
    setAppliedAsOnDate("");
    invalidateReport();
  };

  const applyFilters = () => {
    setAppliedAsOnDate(asOnDate);
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

  const hasData = assetCategories.length > 0;

  const handleExcelExport = () => {
    const rows = [];

    rows.push({
      Code: "",
      Category: "",
      "Amount (₹)": "",
      "Total Amount (₹)": "",
    });

    assetCategories.forEach((item) => {
      const isLeaf = item.level == 4;
      const absAmt = Math.abs(item.amount || 0);
      rows.push({
        Code: "",
        Category: item.category?.trim(),
        "Amount (₹)": isLeaf ? formatAmountRaw(absAmt) : "",
        "Total Amount (₹)": !isLeaf ? formatAmountRaw(absAmt) : "",
      });
    });

    rows.push({
      Code: "",
      Category: "TOTAL ASSETS",
      "Amount (₹)": "",
      "Total Amount (₹)": formatAmountRaw(totalAssets),
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assets Register Summary");
    XLSX.writeFile(wb, `Assets_Register_Summary_${reportInfo.as_on_date}.xlsx`);
  };

  const getIndent = (category, level) => {
    // Calculate indent based on the level (1-4)
    // Level 1: no indent, Level 2: 20px, Level 3: 40px, Level 4: 60px
    return (level - 1) * 20;
  };

  const getRowStyle = (level) => {
    if (level == 1) return "bg-blue-50";
    if (level == 2) return "bg-gray-50";
    if (level == 3) return "bg-white";
    return "bg-white";
  };

  const getTextStyle = (level) => {
    if (level == 1) return "text-gray-900 font-bold";
    if (level == 2) return "text-blue-700 font-semibold";
    if (level == 3) return "text-gray-800";
    return "text-gray-600";
  };

  const renderTable = () => {
    // Group items by level for better display
    const renderRow = (item, idx) => {
      const isLeaf = item.level == 4;
      const isMain = item.level == 1;
      const absAmt = Math.abs(item.amount || 0);
      const indent = getIndent(item.category, item.level);
      const rowStyle = getRowStyle(item.level);
      const textStyle = getTextStyle(item.level);

      return (
        <tr key={`asset-${idx}`} className={rowStyle}>
          <td
            className="py-2 text-sm"
            style={{ paddingLeft: `${12 + indent}px` }}
          >
            <span className={textStyle}>{item.category?.trim()}</span>
          </td>
          <td className="px-3 py-2 text-sm text-right font-mono w-48">
            <span className={isLeaf ? "text-red-500" : ""}>
              {isLeaf ? formatAmountRaw(absAmt) : ""}
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
              {!isLeaf ? formatAmountRaw(absAmt) : ""}
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
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase w-48">
                Amount (₹)
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase w-48">
                Total Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assetCategories.map((item, idx) => renderRow(item, idx))}

            {/* TOTAL ASSETS */}
            <tr className="bg-sky-100">
              <td className="px-3 py-2 text-sm font-bold text-sky-800">
                TOTAL ASSETS
              </td>
              <td className="px-3 py-2"></td>
              <td className="px-3 py-2 text-sm text-right font-mono font-bold text-sky-800">
                {formatAmountRaw(totalAssets)}
              </td>
            </tr>
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
      asOnDate: {
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
      textBold: { fontWeight: "600" },
      mainRow: { backgroundColor: "#ffffff", fontWeight: "600" },
      subRow: { backgroundColor: "#f9fafb" },
      totalRow: {
        backgroundColor: "#e0f2fe",
        fontWeight: "bold",
        borderTop: "2px solid #0284c7",
      },
    };

    const renderPrintRows = () => {
      return assetCategories.map((item, idx) => {
        const isLeaf = item.level == 4;
        const isMain = item.level == 1;
        const absAmt = Math.abs(item.amount || 0);
        const indent = getIndent(item.category, item.level);
        const rowStyle = isMain ? styles.mainRow : isLeaf ? {} : styles.subRow;

        return (
          <tr key={`print-asset-${idx}`} style={rowStyle}>
            <td
              style={{
                ...styles.td,
                paddingLeft: `${8 + indent}px`,
                fontWeight: isMain ? "600" : isLeaf ? "normal" : "500",
                color: isMain ? "#111827" : isLeaf ? "#4b5563" : "#C62828",
              }}
            >
              {item.category?.trim()}
            </td>
            <td
              style={{
                ...styles.tdRight,
                color: isLeaf ? "#dc2626" : "inherit",
              }}
            >
              {isLeaf ? formatAmountRaw(absAmt) : ""}
            </td>
            <td
              style={{
                ...styles.tdRight,
                fontWeight: isMain ? "bold" : "600",
                color: isMain ? "#111827" : "#C62828",
              }}
            >
              {!isLeaf ? formatAmountRaw(absAmt) : ""}
            </td>
          </tr>
        );
      });
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{reportInfo.report_name || pageTitle}</h1>
          {appliedAsOnDate && (
            <div style={styles.asOnDate}>
              As On Date: {formatDate(appliedAsOnDate)}
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
              <th style={styles.th}>Category</th>
              <th style={styles.thRight}>Amount (₹)</th>
              <th style={styles.thRight}>Total Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {renderPrintRows()}
            <tr style={styles.totalRow}>
              <td style={{ ...styles.td, fontWeight: "bold" }}>TOTAL ASSETS</td>
              <td style={styles.tdRight}></td>
              <td style={{ ...styles.tdRight, fontWeight: "bold" }}>
                {formatAmountRaw(totalAssets)}
              </td>
            </tr>
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
                  As On Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={asOnDate}
                    onChange={(e) => setAsOnDate(e.target.value)}
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
                {(hasGenerated || appliedAsOnDate) && (
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
                Loading Assets Register data...
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
                  Select <strong>As On Date</strong> and click{" "}
                  <strong>Generate Report</strong> to view Assets Register
                  Summary.
                </p>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  No data available for the selected date.
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

export default AssetsRegisterSummary;
