import React, { useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiCheck,
  FiX,
} from "react-icons/fi";
import axios from "axios";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";

const DepartmentwiseBudgetSummary = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [budgetData, setBudgetData] = useState([]);
  const [financialYear, setFinancialYear] = useState(null);
  const [totals, setTotals] = useState(null);
  const [pageTitle, setPageTitle] = useState(
    "Department-wise Revenue Expense Summary",
  );

  // Filter states
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("current");
  const [appliedFinancialYear, setAppliedFinancialYear] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();
  const { currentFinancialYear } = useFinancialYear();

  // Get dynamic page title from menu details - Same as ZoneList implementation
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/budget-management/departmentwise-budget";

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

  // Fetch department breakdown data from API
  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/revenue-expense/department-wise-breakdown`;
      const response = await axios.get(url,{ headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } });

      if (response.data?.success) {
        setBudgetData(response.data.data || []);
        setFinancialYear(response.data.financial_year || null);
        setTotals(response.data.totals || null);

        setMessage({
          text: response.data.message || "Data loaded successfully",
          type: "success",
        });
      } else {
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
        setBudgetData([]);
        setTotals(null);
      }
    } catch (err) {
      console.error("Error fetching department data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading department data",
        type: "error",
      });
      setBudgetData([]);
      setTotals(null);
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedFinancialYear("");
    setBudgetData([]);
    setTotals(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setSelectedFinancialYear("current");
    invalidateReport();
  };

  const handleFinancialYearChange = (e) => {
    const next = e.target.value || "";
    setSelectedFinancialYear(next);
    if (hasGenerated) invalidateReport();
  };

  const handleGenerateReport = async () => {
    setAppliedFinancialYear(selectedFinancialYear);
    setHasGenerated(true);
    await fetchBudgetData();
  };

  // Format amount
  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || isNaN(amount)) return "₹ 0.00";

    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return "₹ 0.00";
      return `₹ ${num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } catch (error) {
      return "₹ 0.00";
    }
  };

  // Format percentage
  const formatPercentage = (percentage) => {
    if (percentage == undefined || percentage == null || isNaN(percentage))
      return "0.00%";

    try {
      const num = parseFloat(percentage);
      if (isNaN(num)) return "0.00%";
      return `${num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}%`;
    } catch (error) {
      return "0.00%";
    }
  };

  // Get color class for percentage change
  const getPercentageColorClass = (percentage) => {
    if (percentage == undefined || percentage == null) return "text-gray-600";
    const num = parseFloat(percentage);
    if (isNaN(num)) return "text-gray-600";
    if (num > 0) return "text-green-600";
    if (num < 0) return "text-red-600";
    return "text-gray-600";
  };

  // Print Report Content
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
      tableContainer: {
        width: "100%",
        overflowX: "auto",
        position: "relative",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "15px",
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
      positive: { color: "#059669" },
      negative: { color: "#dc2626" },
    };

    const previousLabel =
      financialYear?.previous_budget?.name || "Previous Year";
    const currentLabel = financialYear?.current_budget?.name || "Current Year";

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <div style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
            Financial Year:{" "}
            {appliedFinancialYear == "current" ? currentLabel : previousLabel}
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thLeft}>Department Name</th>
                <th style={styles.thRight}>Revenue (₹)</th>
                <th style={styles.thRight}>Expense (₹)</th>
                <th style={styles.thRight}>Difference (₹)</th>
                <th style={styles.thRight}>Percentage (%)</th>
              </tr>
            </thead>
            <tbody>
              {budgetData.map((dept, index) => {
                const revenueValue =
                  appliedFinancialYear == "current"
                    ? dept.revenue?.current
                    : dept.revenue?.previous;

                const expenseValue =
                  appliedFinancialYear == "current"
                    ? dept.expense?.current
                    : dept.expense?.previous;

                const differenceValue =
                  appliedFinancialYear == "current"
                    ? dept.net?.current
                    : dept.net?.previous;

                const percentageValue = dept.net?.percentage_change;
                const isPositiveChange = percentageValue > 0;

                return (
                  <tr key={dept.dept_id || index}>
                    <td style={styles.tdLeft}>{dept.dept_name}</td>
                    <td style={styles.tdRight}>{formatAmount(revenueValue)}</td>
                    <td style={styles.tdRight}>{formatAmount(expenseValue)}</td>
                    <td style={styles.tdRight}>
                      {formatAmount(differenceValue)}
                    </td>
                    <td
                      style={{
                        ...styles.tdRight,
                        ...(isPositiveChange
                          ? styles.positive
                          : styles.negative),
                      }}
                    >
                      {formatPercentage(percentageValue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {totals && (
              <tfoot>
                <tr style={{ backgroundColor: "#fdf2f8", fontWeight: "600" }}>
                  <td
                    style={{
                      ...styles.tdLeft,
                      fontWeight: "600",
                      color: "#be123c",
                    }}
                  >
                    GRAND TOTAL
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      fontWeight: "600",
                      color: "#be123c",
                    }}
                  >
                    {formatAmount(
                      appliedFinancialYear == "current"
                        ? totals.revenue?.current
                        : totals.revenue?.previous,
                    )}
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      fontWeight: "600",
                      color: "#be123c",
                    }}
                  >
                    {formatAmount(
                      appliedFinancialYear == "current"
                        ? totals.expense?.current
                        : totals.expense?.previous,
                    )}
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      fontWeight: "600",
                      color: "#be123c",
                    }}
                  >
                    {formatAmount(
                      appliedFinancialYear == "current"
                        ? totals.net?.current
                        : totals.net?.previous,
                    )}
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      fontWeight: "600",
                      color:
                        totals.net?.percentage_change > 0
                          ? "#059669"
                          : "#dc2626",
                    }}
                  >
                    {formatPercentage(totals.net?.percentage_change)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
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
              value={selectedFinancialYear}
              onChange={handleFinancialYearChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="previous">
                {financialYear?.previous_budget?.name ||
                  "Previous (FY 2025-26)"}
              </option>
              <option value="current">
                {financialYear?.current_budget?.name || "Current (FY 2026-27)"}
              </option>
            </select>
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

            {(hasGenerated || appliedFinancialYear) && (
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
      <p className="mt-2 text-gray-500">Loading department data...</p>
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
          Select <strong>Financial Year</strong>, then click{" "}
          <span className="font-medium">Generate Report</span>.
        </p>
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Department Data Found
        </h3>
        <p className="text-gray-600 mb-4">
          No department data available for the selected financial year.
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
    const isCurrentYear = appliedFinancialYear == "current";
    const yearLabel = isCurrentYear
      ? financialYear?.current_budget?.name || "Current Year"
      : financialYear?.previous_budget?.name || "Previous Year";

    return (
      <div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-emerald-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Department Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                  Revenue (₹)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                  Expense (₹)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                  Difference (₹)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                  Percentage (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetData.map((dept, idx) => {
                const revenueValue = isCurrentYear
                  ? dept.revenue?.current
                  : dept.revenue?.previous;

                const expenseValue = isCurrentYear
                  ? dept.expense?.current
                  : dept.expense?.previous;

                const differenceValue = isCurrentYear
                  ? dept.net?.current
                  : dept.net?.previous;

                const percentageValue = dept.net?.percentage_change;
                const isPositiveChange = percentageValue > 0;

                return (
                  <tr
                    key={dept.dept_id || idx}
                    className={`${idx % 2 == 0 ? "bg-white" : "bg-gray-50"} hover:bg-sky-50 transition-colors`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="font-medium">{dept.dept_name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                      {formatAmount(revenueValue)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                      {formatAmount(expenseValue)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                      {formatAmount(differenceValue)}
                    </td>
                    <td
                      className={`px-4 py-3 whitespace-nowrap text-sm text-right font-mono font-semibold ${getPercentageColorClass(percentageValue)}`}
                    >
                      {formatPercentage(percentageValue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {totals && hasGenerated && (
              <tfoot className="bg-pink-50">
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold text-rose-700">
                    GRAND TOTAL
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                    {formatAmount(
                      isCurrentYear
                        ? totals.revenue?.current
                        : totals.revenue?.previous,
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                    {formatAmount(
                      isCurrentYear
                        ? totals.expense?.current
                        : totals.expense?.previous,
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                    {formatAmount(
                      isCurrentYear
                        ? totals.net?.current
                        : totals.net?.previous,
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono ${totals.net?.percentage_change > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatPercentage(totals.net?.percentage_change)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  const hasData = budgetData.length > 0;

  const handleExcelExport = () => {
    const isCurrentYear = appliedFinancialYear == "current";
    const rows = budgetData.map((dept) => ({
      "Department Name": dept.dept_name,
      "Revenue (₹)": isCurrentYear
        ? dept.revenue?.current
        : dept.revenue?.previous,
      "Expense (₹)": isCurrentYear
        ? dept.expense?.current
        : dept.expense?.previous,
      "Difference (₹)": isCurrentYear ? dept.net?.current : dept.net?.previous,
      "Percentage (%)": dept.net?.percentage_change,
    }));
    if (totals)
      rows.push({
        "Department Name": "GRAND TOTAL",
        "Revenue (₹)": isCurrentYear
          ? totals.revenue?.current
          : totals.revenue?.previous,
        "Expense (₹)": isCurrentYear
          ? totals.expense?.current
          : totals.expense?.previous,
        "Difference (₹)": isCurrentYear
          ? totals.net?.current
          : totals.net?.previous,
        "Percentage (%)": totals.net?.percentage_change,
      });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Departmentwise Budget");
    XLSX.writeFile(wb, `DepartmentwiseBudget.xlsx`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title={`${pageTitle}`}
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
        {/* Header with back button and print */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>

          <div className="flex space-x-2">
            <button
              onClick={handleExcelExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
              title="Export to Excel"
            >
              <RiFileExcel2Line className="h-4 w-4 mr-2" /> Excel
            </button>
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
              title="Print Report"
            >
              <FiPrinter className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          {/* Header with dynamic title - Same as ZoneList implementation */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {pageTitle}
            </h2>
          </div>

          {/* Filters */}
          {renderFilters()}

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

export default DepartmentwiseBudgetSummary;
