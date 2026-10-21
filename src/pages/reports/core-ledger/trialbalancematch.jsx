"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiX,
  FiCalendar,
  FiPrinter,
  FiFileText,
  FiCheck,
} from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { useOrganization } from "../../../hooks/useorganization";
import PrintLayout from "../../../components/printlayout";

const TrialBalanceMatch = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [trialBalanceData, setTrialBalanceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [pageTitle, setPageTitle] = useState("Trial Balance Report");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const { organization } = useOrganization();

  const [financialYears, setFinancialYears] = useState([]);
  const [currentFinancialYear, setCurrentFinancialYear] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");

  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");

  const [summaryData, setSummaryData] = useState(null);

  const initialLoadRef = useRef(false);
  const isFetchingRef = useRef(false);
  const printContentRef = useRef(null);

  // Format date as in the image (1-Apr-24 format)
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date
      .toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      })
      .replace(/ /g, "-");
  };

  // Format amount
  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || amount == "") return "0.00";
    const num = parseFloat(amount.toString().replace(/,/g, ""));
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/core-ledger/trialbalancematch";
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

  useEffect(() => {
    fetchFinancialYears();
  }, []);

  useEffect(() => {
    if (currentFinancialYear && !initialLoadRef.current) {
      setInitialDates(currentFinancialYear);
      initialLoadRef.current = true;
    }
  }, [currentFinancialYear]);

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedStartDate("");
    setAppliedEndDate("");
    setTrialBalanceData([]);
    setSummaryData(null);
    setMessage({ text: "", type: "" });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    if (currentFinancialYear) {
      setInitialDates(currentFinancialYear);
      invalidateReport();
    }
  };

  const setInitialDates = (financialYear) => {
    const startDateField = financialYear.St_Date || financialYear.start_date;
    const endDateField = financialYear.Ed_Date || financialYear.end_date;

    const formattedStartDate = startDateField;
    const today = new Date().toISOString().split("T")[0];
    const todayDate = new Date(today);
    const fyEndDate = new Date(endDateField);

    const endDateToUse = todayDate <= fyEndDate ? today : endDateField;

    setStartDate(formattedStartDate);
    setEndDate(endDateToUse);
    setIsDateFilterActive(true);
  };

  const fetchFinancialYears = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/fy-master`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      if (response.data.success && response.data.data.length > 0) {
        const years = response.data.data;
        setFinancialYears(years);

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
        } else {
          const sortedYears = [...years].sort(
            (a, b) => new Date(b.St_Date) - new Date(a.St_Date),
          );
          if (sortedYears.length > 0) {
            const latestYear = sortedYears[0];
            setCurrentFinancialYear({
              financial_year_id: latestYear.FY_Id,
              financial_year_name: latestYear.FY_Name,
              start_date: latestYear.St_Date,
              end_date: latestYear.Ed_Date,
              is_current_year: latestYear.is_current_year,
              fy_code: latestYear.FY_Code,
            });
          }
        }
      } else {
        setDefaultFinancialYear();
      }
    } catch (err) {
      console.error("Error fetching financial years:", err);
      setDefaultFinancialYear();
    }
  };

  const setDefaultFinancialYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    let fiscalYearStart;

    if (today.getMonth() >= 3) {
      fiscalYearStart = new Date(currentYear, 3, 1);
    } else {
      fiscalYearStart = new Date(currentYear - 1, 3, 1);
    }

    const formattedStartDate = fiscalYearStart.toISOString().split("T")[0];
    const formattedEndDate = today.toISOString().split("T")[0];

    setStartDate(formattedStartDate);
    setEndDate(formattedEndDate);
    setIsDateFilterActive(true);

    setCurrentFinancialYear({
      financial_year_id: 0,
      financial_year_name: `${fiscalYearStart.getFullYear()}-${today.getFullYear()}`,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      is_current_year: true,
    });
  };

  const fetchTrialBalanceData = async () => {
    if (!startDate || !endDate || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toISOString().split("T")[0];
      };

      const params = new URLSearchParams({
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        org_id: 1,
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/trial-balance-mismatch-report?${params.toString()}`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      if (response.data?.success) {
        setSummaryData(response.data.summary);

        const processedData = response.data.data.map((item, index) => {
          const parseCurrency = (str) => {
            if (!str || str == "") return 0;
            return parseFloat(str.replace(/,/g, "")) || 0;
          };

          return {
            id: `${item.code || "no-code"}_${index}_${Date.now()}`,
            code: item.code || "",
          
            ledgerEngName: item.ledger_guj_name || "",
            openingDebit: parseCurrency(item.opening_debit),
            openingCredit: parseCurrency(item.opening_credit),
            transactionDebit: parseCurrency(item.transaction_debit),
            transactionCredit: parseCurrency(item.transaction_credit),
            closingDebit: parseCurrency(item.closing_debit),
            closingCredit: parseCurrency(item.closing_credit),
            display: {
              openingDebit: item.opening_debit || "0.00",
              openingCredit: item.opening_credit || "0.00",
              transactionDebit: item.transaction_debit || "0.00",
              transactionCredit: item.transaction_credit || "0.00",
              closingDebit: item.closing_debit || "0.00",
              closingCredit: item.closing_credit || "0.00",
            },
          };
        });

        processedData.sort((a, b) => {
          if (!a.code && !b.code) return 0;
          if (!a.code) return 1;
          if (!b.code) return -1;
          return a.code.localeCompare(b.code);
        });

        setTrialBalanceData(processedData);

        setMessage({
          text:
            response.data.message || `Loaded ${processedData.length} accounts`,
          type: "success",
        });
      } else {
        setMessage({
          text:
            response.data?.message || "No data available for selected period",
          type: "info",
        });
        setTrialBalanceData([]);
        setSummaryData(null);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching trial balance data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading trial balance data",
        type: "error",
      });
      setTrialBalanceData([]);
      setSummaryData(null);
      setLoading(false);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const handleGenerateReport = async () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setHasGenerated(true);
    setCurrentPage(1);
    await fetchTrialBalanceData();
  };

  const handleDateFilterChange = (type, value) => {
    if (type == "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }

    if (value) {
      setIsDateFilterActive(true);
      if (hasGenerated) invalidateReport();
    }
  };

  const resetDateFilter = () => {
    if (currentFinancialYear) {
      setInitialDates(currentFinancialYear);
      invalidateReport();
    }
  };

  const handleFinancialYearSelect = (year) => {
    if (!year) return;

    setCurrentFinancialYear(year);
    setInitialDates(year);
    invalidateReport();
  };

  const exportToExcel = () => {
    if (trialBalanceData.length == 0) {
      setMessage({
        text: "No data to export",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const wb = XLSX.utils.book_new();

      const detailsData = [
        [
          "Code",
          
          "Ledger Name (English)",
          "Opening Debit",
          "Opening Credit",
          "Transaction Debit",
          "Transaction Credit",
          "Closing Debit",
          "Closing Credit",
        ],
      ];

      trialBalanceData.forEach((item) => {
        detailsData.push([
          item.code || "",
          item.ledgerEngName || "",
          item.display.openingDebit || "0.00",
          item.display.openingCredit || "0.00",
          item.display.transactionDebit || "0.00",
          item.display.transactionCredit || "0.00",
          item.display.closingDebit || "0.00",
          item.display.closingCredit || "0.00",
        ]);
      });

      if (summaryData) {
        detailsData.push([
          "TOTALS",
          "",
          "",
          summaryData.total_opening_debit || "0.00",
          summaryData.total_opening_credit || "0.00",
          "",
          "",
          summaryData.total_closing_debit || "0.00",
          summaryData.total_closing_credit || "0.00",
        ]);
      }

      const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);

      const colWidths = [
        { wch: 12 },
        { wch: 40 },
        { wch: 40 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];
      detailsWs["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, detailsWs, "Trial Balance Details");

      const fyName = currentFinancialYear
        ? currentFinancialYear.financial_year_name.replace(/\s+/g, "_")
        : "Current_FY";
      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const filename = `Trial_Balance_${fyName}_${dateStamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      setMessage({
        text: `Excel report downloaded successfully!`,
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

  // Print Report Content — same pattern as departmentwise-budget.jsx
  const PrintReportContent = () => {
    const styles = {
      page: {
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        fontSize: "12px",
      },
      header: {
        textAlign: "center",
        marginBottom: "20px",
        borderBottom: "2px solid #333",
        paddingBottom: "10px",
      },
      title: { fontSize: "18px", fontWeight: "bold", margin: "5px 0" },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "15px",
        fontSize: "11px",
      },
      th: {
        backgroundColor: "#FFCDD2",
        fontWeight: "600",
        padding: "8px",
        border: "1px solid #EF9A9A",
        textAlign: "center",
        color: "#B71C1C",
      },
      thRight: {
        backgroundColor: "#FFCDD2",
        fontWeight: "600",
        padding: "8px",
        border: "1px solid #EF9A9A",
        textAlign: "right",
        color: "#B71C1C",
      },
      td: { padding: "5px 8px", border: "1px solid #e5e7eb" },
      tdRight: {
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        textAlign: "right",
        fontFamily: "monospace",
      },
      totalRow: { backgroundColor: "#fef9c3", fontWeight: "bold" },
    };
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
            Period: {formatDateDisplay(appliedStartDate)} to{" "}
            {formatDateDisplay(appliedEndDate)}
          </div>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Sr. No.</th>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Ledger Name (English)</th>
              <th style={styles.thRight}>Opening Debit (₹)</th>
              <th style={styles.thRight}>Opening Credit (₹)</th>
              <th style={styles.thRight}>Transaction Debit (₹)</th>
              <th style={styles.thRight}>Transaction Credit (₹)</th>
              <th style={styles.thRight}>Closing Debit (₹)</th>
              <th style={styles.thRight}>Closing Credit (₹)</th>
            </tr>
          </thead>
          <tbody>
            {trialBalanceData.map((item, idx) => (
              <tr
                key={item.id}
                style={{ backgroundColor: idx % 2 == 0 ? "#fff" : "#f9fafb" }}
              >
                <td style={{ ...styles.td, textAlign: "center" }}>{idx + 1}</td>
                <td style={styles.td}>{item.code}</td>
                <td style={styles.td}>{item.ledgerEngName}</td>
                <td style={styles.tdRight}>
                  {formatAmount(item.display.openingDebit)}
                </td>
                <td style={styles.tdRight}>
                  {formatAmount(item.display.openingCredit)}
                </td>
                <td style={styles.tdRight}>
                  {formatAmount(item.display.transactionDebit)}
                </td>
                <td style={styles.tdRight}>
                  {formatAmount(item.display.transactionCredit)}
                </td>
                <td style={styles.tdRight}>
                  {formatAmount(item.display.closingDebit)}
                </td>
                <td style={styles.tdRight}>
                  {formatAmount(item.display.closingCredit)}
                </td>
              </tr>
            ))}
          </tbody>
          {summaryData && (
            <tfoot>
              <tr style={styles.totalRow}>
                <td
                  style={{ ...styles.td, fontWeight: "bold", color: "#be123c" }}
                  colSpan={3}
                >
                  કુલ સરવાળો / Grand Total
                </td>
                <td
                  style={{
                    ...styles.tdRight,
                    fontWeight: "bold",
                    color: "#be123c",
                  }}
                >
                  {formatAmount(summaryData.total_opening_debit)}
                </td>
                <td
                  style={{
                    ...styles.tdRight,
                    fontWeight: "bold",
                    color: "#be123c",
                  }}
                >
                  {formatAmount(summaryData.total_opening_credit)}
                </td>
                <td style={{ ...styles.tdRight, fontWeight: "bold", color: "#be123c" }}>-</td>
                <td style={{ ...styles.tdRight, fontWeight: "bold", color: "#be123c" }}>-</td>
                <td
                  style={{
                    ...styles.tdRight,
                    fontWeight: "bold",
                    color: "#be123c",
                  }}
                >
                  {formatAmount(summaryData.total_closing_debit)}
                </td>
                <td
                  style={{
                    ...styles.tdRight,
                    fontWeight: "bold",
                    color: "#be123c",
                  }}
                >
                  {formatAmount(summaryData.total_closing_credit)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = trialBalanceData.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(trialBalanceData.length / itemsPerPage);

  // Generate page numbers to display - exactly like reference image
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const handlePageChange = (page) => {
    if (page == "...") return;
    setCurrentPage(page);
  };

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

  // Render filters section
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Year
            </label>
            <select
              value={currentFinancialYear?.financial_year_id || ""}
              onChange={(e) => {
                const selectedYear = financialYears.find(
                  (year) => year.FY_Id.toString() == e.target.value,
                );
                if (selectedYear) {
                  handleFinancialYearSelect({
                    financial_year_id: selectedYear.FY_Id,
                    financial_year_name: selectedYear.FY_Name,
                    start_date: selectedYear.St_Date,
                    end_date: selectedYear.Ed_Date,
                    is_current_year: selectedYear.is_current_year,
                    fy_code: selectedYear.FY_Code,
                  });
                }
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={loading}
            >
              {financialYears.map((year) => (
                <option key={year.FY_Id} value={year.FY_Id}>
                  {year.FY_Name} {year.is_current_year ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <FiCalendar className="h-4 w-4 text-gray-500 mr-2" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    handleDateFilterChange("start", e.target.value)
                  }
                  className="w-full border-0 p-0 focus:outline-none focus:ring-0 bg-transparent text-sm"
                  disabled={loading}
                />
              </div>
              <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <FiCalendar className="h-4 w-4 text-gray-500 mr-2" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    handleDateFilterChange("end", e.target.value)
                  }
                  className="w-full border-0 p-0 focus:outline-none focus:ring-0 bg-transparent text-sm"
                  disabled={loading}
                />
              </div>
            </div>
            {isDateFilterActive && (
              <button
                onClick={resetDateFilter}
                className="text-blue-600 hover:text-blue-800 text-xs mt-1 flex items-center"
                disabled={loading}
              ></button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              title="Generate Report"
            >
              <FiCheck className="h-4 w-4 mr-2" />
              Generate Report
            </button>

            {(hasGenerated || appliedStartDate) && (
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

  // Render loading state
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500">Loading trial balance data...</p>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-gray-500">{message.text}</p>
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
          Select <strong>Financial Year & Date Range</strong>, then click{" "}
          <span className="font-medium">Generate Report</span>.
        </p>
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Trial Balance Data Found
        </h3>
        <p className="text-gray-600 mb-4">
          No data available for the selected period.
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

  const hasData = trialBalanceData.length > 0;

  // Render data table
  const renderDataTable = () => {
    const isLastPage = currentPage == totalPages;
    return (
      <div>
        {/* Period header */}
        <div className="mb-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">
            Period: {formatDateDisplay(appliedStartDate)} to{" "}
            {formatDateDisplay(appliedEndDate)}
          </span>
          <span className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1}–
            {Math.min(indexOfLastItem, trialBalanceData.length)} of{" "}
            {trialBalanceData.length} accounts
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="px-3 py-2.5 text-center font-semibold border border-blue-700 whitespace-nowrap">
                  Sr. No.
                </th>
                <th className="px-3 py-2.5 text-left font-semibold border border-blue-700 whitespace-nowrap">
                  Code
                </th>
                <th className="px-3 py-2.5 text-left font-semibold border border-blue-700">
                  Ledger Name (English)
                </th>
               
                <th className="px-3 py-2.5 text-right font-semibold border border-blue-700 whitespace-nowrap">
                  Opening Debit (₹)
                </th>
                <th className="px-3 py-2.5 text-right font-semibold border border-blue-700 whitespace-nowrap">
                  Opening Credit (₹)
                </th>
                <th className="px-3 py-2.5 text-right font-semibold border border-blue-700 whitespace-nowrap">
                  Transaction Debit (₹)
                </th>
                <th className="px-3 py-2.5 text-right font-semibold border border-blue-700 whitespace-nowrap">
                  Transaction Credit (₹)
                </th>
                <th className="px-3 py-2.5 text-right font-semibold border border-blue-700 whitespace-nowrap">
                  Closing Debit (₹)
                </th>
                <th className="px-3 py-2.5 text-right font-semibold border border-blue-700 whitespace-nowrap">
                  Closing Credit (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className={idx % 2 == 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-2 border border-gray-200 text-center text-gray-700 whitespace-nowrap">
                    {indexOfFirstItem + idx + 1}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-gray-700 whitespace-nowrap">
                    {item.code}
                  </td>
                 
                  <td className="px-3 py-2 border border-gray-200 text-gray-700">
                    {item.ledgerEngName}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-right font-mono text-gray-900 whitespace-nowrap">
                    {formatAmount(item.display.openingDebit)}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-right font-mono text-gray-900 whitespace-nowrap">
                    {formatAmount(item.display.openingCredit)}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-right font-mono text-gray-900 whitespace-nowrap">
                    {formatAmount(item.display.transactionDebit)}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-right font-mono text-gray-900 whitespace-nowrap">
                    {formatAmount(item.display.transactionCredit)}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-right font-mono text-gray-900 whitespace-nowrap">
                    {formatAmount(item.display.closingDebit)}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-right font-mono text-gray-900 whitespace-nowrap">
                    {formatAmount(item.display.closingCredit)}
                  </td>
                </tr>
              ))}

              {/* Grand Total row — only on last page */}
              {isLastPage && summaryData && (
                <tr className="bg-yellow-50 font-bold border-t-2 border-gray-400">
                  <td
                    className="px-3 py-2.5 border border-gray-300"
                    colSpan={3}
                  >
                    કુલ સરવાળો / Grand Total
                  </td>
                  <td className="px-3 py-2.5 border border-gray-300 text-right font-mono whitespace-nowrap">
                    {formatAmount(summaryData.total_opening_debit)}
                  </td>
                  <td className="px-3 py-2.5 border border-gray-300 text-right font-mono whitespace-nowrap">
                    {formatAmount(summaryData.total_opening_credit)}
                  </td>
                  <td className="px-3 py-2.5 border border-gray-300 text-right font-mono whitespace-nowrap">-</td>
                  <td className="px-3 py-2.5 border border-gray-300 text-right font-mono whitespace-nowrap">-</td>
                  <td className="px-3 py-2.5 border border-gray-300 text-right font-mono whitespace-nowrap">
                    {formatAmount(summaryData.total_closing_debit)}
                  </td>
                  <td className="px-3 py-2.5 border border-gray-300 text-right font-mono whitespace-nowrap">
                    {formatAmount(summaryData.total_closing_credit)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center mt-4 gap-1">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage == 1 || loading}
              className={`px-3 py-1.5 rounded text-sm border ${
                currentPage == 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-blue-600 border-blue-300 hover:bg-blue-50"
              }`}
            >
              ← Previous
            </button>
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(page)}
                disabled={page == "..." || loading}
                className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                  currentPage == page
                    ? "bg-blue-600 text-white border-blue-600"
                    : page == "..."
                      ? "text-gray-400 border-transparent cursor-default"
                      : "text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              disabled={currentPage == totalPages || loading}
              className={`px-3 py-1.5 rounded text-sm border ${
                currentPage == totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-blue-600 border-blue-300 hover:bg-blue-50"
              }`}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {/* Print Layout — same as departmentwise-budget.jsx */}
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
        {/* Header with back button and print/excel */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>

          <div className="flex space-x-2">
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

          {/* Filters */}
          {renderFilters()}

          {/* Message display */}
          {message.text &&
            message.type != "error" &&
            message.type != "info" &&
            hasGenerated && (
              <div
                className={`mb-4 p-3 rounded-lg ${message.type == "success" ? "bg-green-50 text-green-800" : "bg-blue-50 text-blue-800"}`}
              >
                {message.text}
              </div>
            )}

          {/* Loading State */}
          {loading && renderLoading()}

          {/* Error State */}
          {!loading && message.type == "error" && renderError()}

          {/* No Data State */}
          {!loading && !hasData && message.type != "error" && renderNoData()}

          {/* Data Display */}
          {!loading && hasData && renderDataTable()}
        </div>
      </div>
    </div>
  );
};

export default TrialBalanceMatch;
