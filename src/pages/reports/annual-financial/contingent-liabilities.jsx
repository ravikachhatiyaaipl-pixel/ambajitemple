import React, { useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiCheck,
  FiX,
  FiCalendar,
  FiFileText,
} from "react-icons/fi";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import axios from "axios";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const ContingentLiabilities = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [liabilitiesData, setLiabilitiesData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [reportMeta, setReportMeta] = useState({
    report_name: "CONTINGENT LIABILITY REGISTER",
    as_on_date: "",
    generated_on: "",
  });

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
  const [pageTitle, setPageTitle] = useState("Contingent Liabilities Register");
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/annual-financial/contingent-liabilities";
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

  // Set default date range (last 30 days to today)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setFromDate(formatDate(thirtyDaysAgo));
    setToDate(formatDate(today));
  }, []);

  // Fetch contingent liabilities data from API
  const fetchLiabilitiesData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      // Use appliedToDate as the as_on_date parameter
      const params = {};
      if (appliedToDate) {
        params.as_on_date = appliedToDate;
      } else if (appliedFromDate) {
        params.as_on_date = appliedFromDate;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/contingent-liabilities/register`,
        { params,
          headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } 
         },
      );

      if (response.data?.success) {
        setLiabilitiesData(response.data.data?.liabilities || []);
        setSummary(response.data.data?.summary || null);
        setReportMeta({
          report_name:
            response.data.data?.report_name || "CONTINGENT LIABILITY REGISTER",
          as_on_date: response.data.data?.as_on_date || "",
          generated_on: response.data.data?.generated_on || "",
        });
        setMessage({ text: "Data loaded successfully", type: "success" });
      } else {
        setLiabilitiesData([]);
        setSummary(null);
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      console.error("Error fetching contingent liabilities data:", err);
      setLiabilitiesData([]);
      setSummary(null);
      setMessage({
        text:
          err.response?.data?.message ||
          "Error loading contingent liabilities data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setLiabilitiesData([]);
    setSummary(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    setFromDate(formatDate(thirtyDaysAgo));
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
    await fetchLiabilitiesData();
  };

  // Format amount
  const formatAmount = (amountFormatted) => {
    if (!amountFormatted) return " 0.00";
    return ` ${amountFormatted}`;
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "-";
    try {
      // Handle both YYYY-MM-DD and DD/MM/YYYY formats
      if (dateStr.includes("-")) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    try {
      const date = new Date(dateTimeStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return dateTimeStr;
    } catch {
      return dateTimeStr;
    }
  };

  const hasData = liabilitiesData.length > 0;

  const handleExcelExport = () => {
    const rows = [];

    // Add header row with report info
    rows.push({
      Report: reportMeta.report_name,
      "As On Date": reportMeta.as_on_date,
      "Generated On": reportMeta.generated_on,
    });
    rows.push({});

    // Data rows (removed Description and Last Updated)
    liabilitiesData.forEach((item) => {
      rows.push({
        "SR No.": item.sr_no,
        "Liability Type": item.liability_type,
        "Case/Reference No.": item.case_or_reference_no,
        "Amount (₹)": item.amount_rs_formatted,
        Status: item.status,
        "Expected Resolution Date": formatDateDisplay(
          item.expected_resolution_date,
        ),
        Remarks: item.remarks,
      });
    });

    // Add summary row
    if (summary) {
      rows.push({});
      rows.push({
        "Total Cases": summary.total_cases,
        "Total Liabilities (₹)": summary.total_liabilities_formatted,
      });
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contingent Liabilities");

    // Adjust column widths (removed Description and Last Updated columns)
    ws["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 20 },
      { wch: 18 },
      { wch: 25 },
      { wch: 22 },
      { wch: 50 },
    ];

    XLSX.writeFile(
      wb,
      `Contingent_Liabilities_${reportMeta.as_on_date.replace(/\//g, "-") || new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const renderTable = () => {
    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16">
                SR No.
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Liability Type
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Case/Reference No.
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase w-32">
                Amount (₹)
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32">
                Expected Resolution
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {liabilitiesData.map((item) => (
              <tr key={item.sr_no} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm text-gray-500">
                  {item.sr_no}
                </td>
                <td className="px-3 py-2 text-sm font-medium text-blue-700">
                  {item.liability_type}
                </td>
                <td className="px-3 py-2 text-sm">
                  {item.case_or_reference_no}
                </td>
                <td className="px-3 py-2 text-sm text-right font-mono font-semibold text-red-600">
                  {formatAmount(item.amount_rs_formatted)}
                </td>
                <td className="px-3 py-2 text-sm">
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm">
                  {formatDateDisplay(item.expected_resolution_date)}
                </td>
                <td
                  className="px-3 py-2 text-sm text-gray-500 max-w-xs truncate"
                  title={item.remarks}
                >
                  {item.remarks}
                </td>
              </tr>
            ))}
          </tbody>
          {summary && (
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td
                  colSpan="3"
                  className="px-3 py-3 text-sm font-bold text-gray-700 text-right"
                >
                  {/* Total ({summary.total_cases} Cases): */}
                </td>
                <td className="px-3 py-3 text-sm font-bold text-right font-mono text-red-700">
                  {formatAmount(summary.total_liabilities_formatted)}
                </td>
                <td colSpan="3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
  };

  // Print content - Total only appears once at the end (last page)
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
        marginBottom: "20px",
        borderBottom: "2px solid #333",
        paddingBottom: "10px",
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
      metaInfo: {
        fontSize: "10px",
        color: "#666",
        marginTop: "8px",
        display: "flex",
        justifyContent: "space-between",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "15px 0",
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
      totalRow: {
        backgroundColor: "#e0f2fe",
        fontWeight: "bold",
      },
      statusBadge: {
        backgroundColor: "#fef3c7",
        color: "#92400e",
        padding: "2px 6px",
        borderRadius: "12px",
        fontSize: "9px",
      },
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <div style={styles.subTitle}>{reportMeta.report_name}</div>
          <div style={styles.metaInfo}>
            <span>As On Date: {reportMeta.as_on_date}</span>
            <span>Generated On: {reportMeta.generated_on}</span>
          </div>
          {(appliedFromDate || appliedToDate) && (
            <div style={styles.subTitle}>
              Period: {formatDateDisplay(appliedFromDate)} to{" "}
              {formatDateDisplay(appliedToDate)}
            </div>
          )}
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>SR No.</th>
              <th style={styles.th}>Liability Type</th>
              <th style={styles.th}>Case/Ref No.</th>
              <th style={styles.thRight}>Amount (₹)</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Expected Resolution</th>
              <th style={styles.th}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {liabilitiesData.map((item) => (
              <tr key={item.sr_no}>
                <td style={styles.td}>{item.sr_no}</td>
                <td style={styles.td}>{item.liability_type}</td>
                <td style={styles.td}>{item.case_or_reference_no}</td>
                <td style={{ ...styles.tdRight, color: "#dc2626" }}>
                  {formatAmount(item.amount_rs_formatted)}
                </td>
                <td style={styles.td}>
                  <span style={styles.statusBadge}>{item.status}</span>
                </td>
                <td style={styles.td}>
                  {formatDateDisplay(item.expected_resolution_date)}
                </td>
                <td style={styles.td}>{item.remarks}</td>
              </tr>
            ))}
          </tbody>
          {/* Total row - appears only once at the end of the table (last page) */}
          {summary && (
            <tfoot>
              <tr style={styles.totalRow}>
                <td
                  colSpan="3"
                  style={{
                    ...styles.td,
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  {/* Total ({summary.total_cases} Cases): */}
                </td>
                <td
                  style={{
                    ...styles.tdRight,
                    fontWeight: "bold",
                    color: "#dc2626",
                  }}
                >
                  {formatAmount(summary.total_liabilities_formatted)}
                </td>
                <td colSpan="3" style={styles.td}></td>
              </tr>
            </tfoot>
          )}
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
                  To Date (As On Date)
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
                Loading contingent liabilities data...
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
                <FiFileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Generate report to view results
                </h3>
                <p className="text-gray-600 mb-4">
                  Select <strong>Date Range</strong> and click{" "}
                  <strong>Generate Report</strong> to view Contingent
                  Liabilities Register.
                </p>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  No contingent liabilities data available for the selected
                  period.
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
          {!loading && hasData && (
            <>
              {/* Report Meta Info */}
              {/* <div className="mb-4 flex justify-between items-center text-sm text-gray-500 border-b pb-2">
                                <div>
                                    <span className="font-medium">Report:</span> {reportMeta.report_name}
                                </div>
                                <div>
                                    <span className="font-medium">As On Date:</span> {reportMeta.as_on_date}
                                </div>
                                <div>
                                    <span className="font-medium">Generated On:</span> {reportMeta.generated_on}
                                </div>
                            </div> */}
              {renderTable()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContingentLiabilities;
