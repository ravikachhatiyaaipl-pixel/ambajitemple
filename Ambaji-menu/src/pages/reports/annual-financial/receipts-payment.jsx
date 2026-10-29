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

const ReceiptsPayment = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [openingBalance, setOpeningBalance] = useState([]);
  const [revenueReceipts, setRevenueReceipts] = useState([]);
  const [capitalReceipts, setCapitalReceipts] = useState([]);
  const [revenuePayments, setRevenuePayments] = useState([]);
  const [capitalPayments, setCapitalPayments] = useState([]);
  const [closingBalance, setClosingBalance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [reportInfo, setReportInfo] = useState({
    report_name: "",
    period: { start_date: "", end_date: "" },
    generated_on: "",
  });
  const [hasGenerated, setHasGenerated] = useState(false);
  const [pageTitle, setPageTitle] = useState("Receipts & Payments Statement");

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
      const currentPath = "/reports/finance/receipts-payment";
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

  // Fetch Receipts & Payments Statement data
  const fetchData = async (start = appliedStartDate, end = appliedEndDate) => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const params = {};
      if (start) params.start_date = start;
      if (end) params.end_date = end;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/receipts-payments`,
        {
          params,
          headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` }
        },
      );

      console.log("API Response:", response.data); // Debug log

      if (response.data?.success) {
        const data = response.data.data || {};

        console.log("Extracted Data:", data); // Debug log

        // Set the data from API response
        setOpeningBalance(data.opening_balance || []);
        setRevenueReceipts(data.revenue_receipts || []);
        setCapitalReceipts(data.capital_receipts || []);
        setRevenuePayments(data.revenue_payments || []);
        setCapitalPayments(data.capital_payments || []);
        setClosingBalance(data.closing_balance || []);
        setSummary(data.summary || null);
        setReportInfo({
          report_name: data.report_name || pageTitle,
          period: data.period || { start_date: start, end_date: end },
          generated_on: data.generated_on || new Date().toLocaleString(),
        });
        setMessage({ text: "Data loaded successfully", type: "success" });

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 3000);
      } else {
        setOpeningBalance([]);
        setRevenueReceipts([]);
        setCapitalReceipts([]);
        setRevenuePayments([]);
        setCapitalPayments([]);
        setClosingBalance([]);
        setSummary(null);
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      console.error("Error fetching receipts & payments data:", err);
      setOpeningBalance([]);
      setRevenueReceipts([]);
      setCapitalReceipts([]);
      setRevenuePayments([]);
      setCapitalPayments([]);
      setClosingBalance([]);
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
    setOpeningBalance([]);
    setRevenueReceipts([]);
    setCapitalReceipts([]);
    setRevenuePayments([]);
    setCapitalPayments([]);
    setClosingBalance([]);
    setSummary(null);
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
    if (!startDate || !endDate) {
      setMessage({
        text: "Please select both start date and end date",
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

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

  const hasData = () => {
    return (
      openingBalance.length > 0 ||
      revenueReceipts.length > 0 ||
      capitalReceipts.length > 0 ||
      revenuePayments.length > 0 ||
      capitalPayments.length > 0 ||
      closingBalance.length > 0
    );
  };

  const handleExcelExport = () => {
    if (!hasData()) {
      setMessage({ text: "No data to export", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    const rows = [];

    rows.push({ Section: "", Particulars: "", "Amount (₹)": "" });

    // Opening Balance Section
    if (openingBalance.length > 0) {
      rows.push({
        Section: "OPENING BALANCE",
        Particulars: "",
        "Amount (₹)": "",
      });
      openingBalance.forEach((item) => {
        rows.push({
          Section: "",
          Particulars: item.particular,
          "Amount (₹)": formatAmountRaw(item.amount),
        });
      });
      if (summary?.total_opening_balance != undefined) {
        rows.push({
          Section: "",
          Particulars: "Total Opening Balance",
          "Amount (₹)": formatAmountRaw(summary.total_opening_balance),
        });
      }
      rows.push({ Section: "", Particulars: "", "Amount (₹)": "" });
    }

    // Revenue Receipts Section
    if (revenueReceipts.length > 0) {
      rows.push({
        Section: "REVENUE RECEIPTS",
        Particulars: "",
        "Amount (₹)": "",
      });
      revenueReceipts.forEach((item) => {
        rows.push({
          Section: "",
          Particulars: item.particular,
          "Amount (₹)": formatAmountRaw(item.amount),
        });
      });
      if (summary?.total_revenue_receipts != undefined) {
        rows.push({
          Section: "",
          Particulars: "Total Revenue Receipts",
          "Amount (₹)": formatAmountRaw(summary.total_revenue_receipts),
        });
      }
      rows.push({ Section: "", Particulars: "", "Amount (₹)": "" });
    }

    // Capital Receipts Section
    if (capitalReceipts.length > 0) {
      rows.push({
        Section: "CAPITAL RECEIPTS",
        Particulars: "",
        "Amount (₹)": "",
      });
      capitalReceipts.forEach((item) => {
        rows.push({
          Section: "",
          Particulars: item.particular,
          "Amount (₹)": formatAmountRaw(item.amount),
        });
      });
      if (summary?.total_capital_receipts != undefined) {
        rows.push({
          Section: "",
          Particulars: "Total Capital Receipts",
          "Amount (₹)": formatAmountRaw(summary.total_capital_receipts),
        });
      }
      rows.push({ Section: "", Particulars: "", "Amount (₹)": "" });
    }

    // Total Receipts
    if (summary?.total_receipts != undefined) {
      rows.push({
        Section: "",
        Particulars: "TOTAL RECEIPTS",
        "Amount (₹)": formatAmountRaw(summary.total_receipts),
      });
      rows.push({ Section: "", Particulars: "", "Amount (₹)": "" });
    }

    // Revenue Payments Section
    if (revenuePayments.length > 0) {
      rows.push({
        Section: "REVENUE PAYMENTS",
        Particulars: "",
        "Amount (₹)": "",
      });
      revenuePayments.forEach((item) => {
        rows.push({
          Section: "",
          Particulars: item.particular,
          "Amount (₹)": formatAmountRaw(item.amount),
        });
      });
      if (summary?.total_revenue_payments != undefined) {
        rows.push({
          Section: "",
          Particulars: "Total Revenue Payments",
          "Amount (₹)": formatAmountRaw(summary.total_revenue_payments),
        });
      }
      rows.push({ Section: "", Particulars: "", "Amount (₹)": "" });
    }

    // Capital Payments Section
    if (capitalPayments.length > 0) {
      rows.push({
        Section: "CAPITAL PAYMENTS",
        Particulars: "",
        "Amount (₹)": "",
      });
      capitalPayments.forEach((item) => {
        rows.push({
          Section: "",
          Particulars: item.particular,
          "Amount (₹)": formatAmountRaw(item.amount),
        });
      });
      if (summary?.total_capital_payments != undefined) {
        rows.push({
          Section: "",
          Particulars: "Total Capital Payments",
          "Amount (₹)": formatAmountRaw(summary.total_capital_payments),
        });
      }
      rows.push({ Section: "", Particulars: "", "Amount (₹)": "" });
    }

    // Total Payments
    if (summary?.total_payments != undefined) {
      rows.push({
        Section: "",
        Particulars: "TOTAL PAYMENTS",
        "Amount (₹)": formatAmountRaw(summary.total_payments),
      });
      rows.push({ Section: "", Particulars: "", "Amount (₹)": "" });
    }

    // Net Surplus/Deficit
    if (summary?.net_surplus_deficit != undefined) {
      rows.push({
        Section: "",
        Particulars: "Net Surplus / Deficit",
        "Amount (₹)": formatAmountRaw(summary.net_surplus_deficit),
      });
      rows.push({ Section: "", Particulars: "", "Amount (₹)": "" });
    }

    // Closing Balance Section
    if (closingBalance.length > 0) {
      rows.push({
        Section: "CLOSING BALANCE",
        Particulars: "",
        "Amount (₹)": "",
      });
      closingBalance.forEach((item) => {
        rows.push({
          Section: "",
          Particulars: item.particular,
          "Amount (₹)": formatAmountRaw(item.amount),
        });
      });
      if (summary?.total_closing_balance != undefined) {
        rows.push({
          Section: "",
          Particulars: "Total Closing Balance",
          "Amount (₹)": formatAmountRaw(summary.total_closing_balance),
        });
      }
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipts & Payments");
    XLSX.writeFile(
      wb,
      `Receipts_Payments_${reportInfo.period.start_date}_to_${reportInfo.period.end_date}.xlsx`,
    );
  };

  const getAmountColorClass = (amount) => {
    if (amount < 0) return "text-red-600";
    return "text-green-600";
  };

  const renderSection = (
    title,
    data,
    bgColorClass,
    showTotal = true,
    totalValue = null,
  ) => {
    if (data.length == 0 && !showTotal) return null;
    if (data.length == 0 && showTotal && totalValue == null) return null;

    return (
      <>
        <tr className={bgColorClass}>
          <td className="px-3 py-2 text-sm font-bold" colSpan={2}>
            {title}
          </td>
        </tr>
        {data.map((item, idx) => (
          <tr key={`${title}-${idx}`} className="bg-white">
            <td
              className="px-3 py-2 text-sm"
              style={{ paddingLeft: `${24}px` }}
            >
              {item.particular}
            </td>
            <td
              className={`px-3 py-2 text-sm text-right font-mono ${getAmountColorClass(item.amount)}`}
            >
              {formatAmountRaw(item.amount)}
            </td>
          </tr>
        ))}
        {showTotal &&
          totalValue != undefined &&
          totalValue != null &&
          data.length > 0 && (
            <tr className="bg-gray-100 font-semibold">
              <td
                className="px-3 py-2 text-sm"
                style={{ paddingLeft: `${24}px` }}
              >
                Total {title}
              </td>
              <td
                className={`px-3 py-2 text-sm text-right font-mono ${getAmountColorClass(totalValue)}`}
              >
                {formatAmountRaw(totalValue)}
              </td>
            </tr>
          )}
      </>
    );
  };

  const renderTable = () => {
    const hasAnyReceipts =
      revenueReceipts.length > 0 || capitalReceipts.length > 0;
    const hasAnyPayments =
      revenuePayments.length > 0 || capitalPayments.length > 0;

    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Particulars
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase w-48">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Opening Balance Section */}
            {renderSection(
              "OPENING BALANCE",
              openingBalance,
              "bg-yellow-50",
              true,
              summary?.total_opening_balance,
            )}

            {/* Revenue Receipts Section */}
            {renderSection(
              "REVENUE RECEIPTS",
              revenueReceipts,
              "bg-green-50",
              true,
              summary?.total_revenue_receipts,
            )}

            {/* Capital Receipts Section */}
            {renderSection(
              "CAPITAL RECEIPTS",
              capitalReceipts,
              "bg-emerald-50",
              true,
              summary?.total_capital_receipts,
            )}

            {hasAnyReceipts && summary?.total_receipts != undefined && (
              <>
                <tr className="bg-blue-100">
                  <td
                    className="px-3 py-2 text-sm font-bold text-blue-800"
                    colSpan={2}
                  >
                    TOTAL RECEIPTS
                  </td>
                </tr>
                <tr className="bg-blue-50 font-bold">
                  <td
                    className="px-3 py-2 text-sm"
                    style={{ paddingLeft: `24px` }}
                  >
                    Total Receipts (Revenue + Capital)
                  </td>
                  <td className="px-3 py-2 text-sm text-right font-mono text-green-600">
                    {formatAmountRaw(summary.total_receipts)}
                  </td>
                </tr>
              </>
            )}

            {/* Revenue Payments Section */}
            {renderSection(
              "REVENUE PAYMENTS",
              revenuePayments,
              "bg-red-50",
              true,
              summary?.total_revenue_payments,
            )}

            {/* Capital Payments Section */}
            {renderSection(
              "CAPITAL PAYMENTS",
              capitalPayments,
              "bg-orange-50",
              true,
              summary?.total_capital_payments,
            )}

            {/* Total Payments */}
            {hasAnyPayments && summary?.total_payments != undefined && (
              <>
                <tr className="bg-red-100">
                  <td
                    className="px-3 py-2 text-sm font-bold text-red-800"
                    colSpan={2}
                  >
                    TOTAL PAYMENTS
                  </td>
                </tr>
                <tr className="bg-red-50 font-bold">
                  <td
                    className="px-3 py-2 text-sm"
                    style={{ paddingLeft: `24px` }}
                  >
                    Total Payments (Revenue + Capital)
                  </td>
                  <td className="px-3 py-2 text-sm text-right font-mono text-red-600">
                    {formatAmountRaw(summary.total_payments)}
                  </td>
                </tr>
              </>
            )}

            {/* Net Surplus / Deficit */}
            {summary?.net_surplus_deficit != undefined && (
              <>
                <tr className="bg-sky-100">
                  <td
                    className="px-3 py-2 text-sm font-bold text-sky-800"
                    colSpan={2}
                  >
                    NET SURPLUS / DEFICIT
                  </td>
                </tr>
                <tr className="bg-sky-50">
                  <td
                    className="px-3 py-2 text-sm"
                    style={{ paddingLeft: `${24}px` }}
                  >
                    Net Surplus / Deficit for the Period
                  </td>
                  <td
                    className={`px-3 py-2 text-sm text-right font-mono font-bold ${summary.net_surplus_deficit >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatAmountRaw(summary.net_surplus_deficit)}
                  </td>
                </tr>
              </>
            )}

            {/* Closing Balance Section */}
            {renderSection(
              "CLOSING BALANCE",
              closingBalance,
              "bg-purple-50",
              true,
              summary?.total_closing_balance,
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
      revenueReceiptsHeader: {
        backgroundColor: "#d1fae5",
        fontWeight: "bold",
        color: "#065f46",
      },
      capitalReceiptsHeader: {
        backgroundColor: "#a7f3d0",
        fontWeight: "bold",
        color: "#064e3b",
      },
      revenuePaymentsHeader: {
        backgroundColor: "#fee2e2",
        fontWeight: "bold",
        color: "#991b1b",
      },
      capitalPaymentsHeader: {
        backgroundColor: "#ffedd5",
        fontWeight: "bold",
        color: "#9a3412",
      },
      summaryRow: {
        backgroundColor: "#e0f2fe",
        fontWeight: "bold",
      },
    };

    const renderPrintSection = (title, data, headerStyle, totalValue) => {
      if (data.length == 0) return null;

      return (
        <>
          <tr style={headerStyle}>
            <td style={{ ...styles.td, fontWeight: "bold" }} colSpan={2}>
              {title}
            </td>
          </tr>
          {data.map((item, idx) => (
            <tr key={`print-${title}-${idx}`}>
              <td style={{ ...styles.td, paddingLeft: "20px" }}>
                {item.particular}
              </td>
              <td style={styles.tdRight}>{formatAmountRaw(item.amount)}</td>
            </tr>
          ))}
          {totalValue != undefined && totalValue != null && (
            <tr style={{ backgroundColor: "#f3f4f6", fontWeight: "600" }}>
              <td
                style={{ ...styles.td, paddingLeft: "20px", fontWeight: "600" }}
              >
                Total {title}
              </td>
              <td style={{ ...styles.tdRight, fontWeight: "600" }}>
                {formatAmountRaw(totalValue)}
              </td>
            </tr>
          )}
        </>
      );
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
            {/* Opening Balance Section */}
            {renderPrintSection(
              "OPENING BALANCE",
              openingBalance,
              styles.sectionHeader,
              summary?.total_opening_balance,
            )}

            {renderPrintSection(
              "REVENUE RECEIPTS",
              revenueReceipts,
              styles.revenueReceiptsHeader,
              summary?.total_revenue_receipts,
            )}

            {renderPrintSection(
              "CAPITAL RECEIPTS",
              capitalReceipts,
              styles.capitalReceiptsHeader,
              summary?.total_capital_receipts,
            )}

            {(revenueReceipts.length > 0 || capitalReceipts.length > 0) &&
              summary?.total_receipts != undefined && (
                <>
                  <tr
                    style={{ backgroundColor: "#FFCDD2", fontWeight: "bold" }}
                  >
                    <td
                      style={{ ...styles.td, fontWeight: "bold" }}
                      colSpan={2}
                    >
                      TOTAL RECEIPTS
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: "#ffffff" }}>
                    <td
                      style={{
                        ...styles.td,
                        paddingLeft: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      Total Receipts (Revenue + Capital)
                    </td>
                    <td style={{ ...styles.tdRight, fontWeight: "bold" }}>
                      {formatAmountRaw(summary.total_receipts)}
                    </td>
                  </tr>
                </>
              )}

            {/* Revenue Payments Section */}
            {renderPrintSection(
              "REVENUE PAYMENTS",
              revenuePayments,
              styles.revenuePaymentsHeader,
              summary?.total_revenue_payments,
            )}

            {/* Capital Payments Section */}
            {renderPrintSection(
              "CAPITAL PAYMENTS",
              capitalPayments,
              styles.capitalPaymentsHeader,
              summary?.total_capital_payments,
            )}

            {/* Total Payments */}
            {(revenuePayments.length > 0 || capitalPayments.length > 0) &&
              summary?.total_payments != undefined && (
                <>
                  <tr
                    style={{ backgroundColor: "#fee2e2", fontWeight: "bold" }}
                  >
                    <td
                      style={{ ...styles.td, fontWeight: "bold" }}
                      colSpan={2}
                    >
                      TOTAL PAYMENTS
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: "#fef2f2" }}>
                    <td
                      style={{
                        ...styles.td,
                        paddingLeft: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      Total Payments (Revenue + Capital)
                    </td>
                    <td style={{ ...styles.tdRight, fontWeight: "bold" }}>
                      {formatAmountRaw(summary.total_payments)}
                    </td>
                  </tr>
                </>
              )}

            {/* Net Surplus / Deficit */}
            {summary?.net_surplus_deficit != undefined && (
              <>
                <tr style={styles.summaryRow}>
                  <td style={{ ...styles.td, fontWeight: "bold" }} colSpan={2}>
                    NET SURPLUS / DEFICIT
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#f0f9ff" }}>
                  <td style={{ ...styles.td, paddingLeft: "20px" }}>
                    Net Surplus / Deficit for the Period
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      fontWeight: "bold",
                      color:
                        summary.net_surplus_deficit >= 0
                          ? "#16a34a"
                          : "#dc2626",
                    }}
                  >
                    {formatAmountRaw(summary.net_surplus_deficit)}
                  </td>
                </tr>
              </>
            )}

            {/* Closing Balance Section */}
            {renderPrintSection(
              "CLOSING BALANCE",
              closingBalance,
              styles.sectionHeader,
              summary?.total_closing_balance,
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
              disabled={!hasData() || loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              title="Export to Excel"
            >
              <RiFileExcel2Line className="h-4 w-4 mr-2" />
              Excel
            </button>
            <button
              onClick={() => setShowPrint(true)}
              disabled={!hasData() || loading}
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

          {/* Message Display */}
          {message.text && (
            <div
              className={`mb-4 p-3 rounded-lg ${message.type == "success"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : message.type == "error"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                }`}
            >
              {message.text}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">
                Loading Receipts & Payments data...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && message.type == "error" && !hasData() && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{message.text}</p>
            </div>
          )}

          {/* No Data State */}
          {!loading &&
            !hasData() &&
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
                  <strong>Generate Report</strong> to view Receipts & Payments
                  Statement.
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
          {!loading && hasData() && <>{renderTable()}</>}
        </div>
      </div>
    </div>
  );
};

export default ReceiptsPayment;
