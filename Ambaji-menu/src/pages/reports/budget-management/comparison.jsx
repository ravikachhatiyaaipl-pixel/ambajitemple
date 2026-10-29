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

const BudgetComparison = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [budgetData, setBudgetData] = useState([]);
  const [totals, setTotals] = useState(null);
  const [financialYear, setFinancialYear] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [previousFinancialYear, setPreviousFinancialYear] = useState(null);

  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();
  const { currentFinancialYear } = useFinancialYear();

  const currentFYCode = currentFinancialYear?.FY_Code || "";

  useEffect(() => {
    if (currentFYCode) {
      const parts = currentFYCode.split("-");
      if (parts.length == 2) {
        const prev = parseInt(parts[0]) - 1;
        setPreviousFinancialYear(`${prev}-${(prev + 1).toString().slice(-2)}`);
      }
    }
  }, [currentFYCode]);

  const prevLabel = previousFinancialYear
    ? `Previous (${previousFinancialYear})`
    : "Previous Year";
  const currLabel = currentFYCode
    ? `Current (${currentFYCode})`
    : "Current Year";

  const fetchData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/revenue-expense/department-summary`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );
      if (response.data?.success) {
        setBudgetData(response.data.data || []);
        setTotals(response.data.total || null);
        setFinancialYear(response.data.financial_year || null);
        setMessage({ text: "Data loaded successfully", type: "success" });
      } else {
        setBudgetData([]);
        setTotals(null);
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      setBudgetData([]);
      setTotals(null);
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
    setBudgetData([]);
    setTotals(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => invalidateReport();

  const handleGenerateReport = async () => {
    setHasGenerated(true);
    await fetchData();
  };

  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || amount == "") return "-";
    const num = parseFloat(amount);
    if (isNaN(num)) return "-";
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const hasData = budgetData.length > 0;

  const handleExcelExport = () => {
    const rows = budgetData.map((dept) => ({
      "Department Name": dept.dept_name,
      [`${prevLabel} (₹)`]: dept.previous_amount,
      [`${currLabel} (₹)`]: dept.current_amount,
      "% Change":
        dept.percentage_change != null
          ? `${dept.percentage_change >= 0 ? "+" : ""}${dept.percentage_change.toFixed(2)}%`
          : "-",
    }));
    if (totals) {
      const prevTotal = parseFloat(totals.previous) || 0;
      const currTotal = parseFloat(totals.current) || 0;
      const totalPct =
        prevTotal != 0 ? ((currTotal - prevTotal) / prevTotal) * 100 : null;
      rows.push({
        "Department Name": "GRAND TOTAL",
        [`${prevLabel} (₹)`]: totals.previous,
        [`${currLabel} (₹)`]: totals.current,
        "% Change":
          totalPct != null
            ? `${totalPct >= 0 ? "+" : ""}${totalPct.toFixed(2)}%`
            : "-",
      });
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Budget Comparison");
    XLSX.writeFile(wb, `BudgetComparison.xlsx`);
  };

  const renderDataTable = () => (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-emerald-50 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
              Department Name
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
              {prevLabel} (₹)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
              {currLabel} (₹)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
              %
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {budgetData.map((dept, idx) => {
            const pct = dept.percentage_change;
            return (
              <tr
                key={dept.dept_id || idx}
                className={`${idx % 2 == 0 ? "bg-white" : "bg-gray-50"} hover:bg-sky-50 transition-colors`}
              >
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {dept.dept_name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                  {formatAmount(dept.previous_amount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                  {formatAmount(dept.current_amount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono">
                  {pct != null ? (
                    <span
                      className={pct >= 0 ? "text-green-600" : "text-red-600"}
                    >
                      {pct >= 0 ? "+" : ""}
                      {pct.toFixed(2)}%
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        {totals &&
          hasData &&
          (() => {
            const prevTotal = parseFloat(totals.previous) || 0;
            const currTotal = parseFloat(totals.current) || 0;
            const totalPct =
              prevTotal != 0
                ? ((currTotal - prevTotal) / prevTotal) * 100
                : null;
            return (
              <tfoot className="bg-pink-50">
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold text-rose-700">
                    GRAND TOTAL
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                    {formatAmount(totals.previous)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                    {formatAmount(totals.current)}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono ${totalPct >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {totalPct != null
                      ? `${totalPct >= 0 ? "+" : ""}${totalPct.toFixed(2)}%`
                      : "-"}
                  </td>
                </tr>
              </tfoot>
            );
          })()}
      </table>
    </div>
  );

  // Print content
  const PrintReportContent = () => {
    const styles = {
      table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "8px",
        fontSize: "10px",
      },
      th: {
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
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      tdRight: {
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
        textAlign: "right",
      },
      totalRow: {
        backgroundColor: "#fdf2f8",
        fontWeight: "600",
        color: "#be123c",
      },
    };
    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <h1 style={{ fontSize: "16px", fontWeight: "bold" }}>
            Department-wise Budget Comparison
          </h1>
          <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
            {prevLabel} vs {currLabel}
          </div>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Department Name</th>
              <th style={styles.thRight}>{prevLabel} (₹)</th>
              <th style={styles.thRight}>{currLabel} (₹)</th>
              <th style={styles.thRight}>% Change</th>
            </tr>
          </thead>
          <tbody>
            {budgetData.map((dept, idx) => {
              const pct = dept.percentage_change;
              return (
                <tr key={dept.dept_id || idx}>
                  <td style={styles.td}>{dept.dept_name}</td>
                  <td style={styles.tdRight}>
                    {formatAmount(dept.previous_amount)}
                  </td>
                  <td style={styles.tdRight}>
                    {formatAmount(dept.current_amount)}
                  </td>
                  <td
                    style={{
                      ...styles.tdRight,
                      color:
                        pct != null
                          ? pct >= 0
                            ? "#16a34a"
                            : "#dc2626"
                          : undefined,
                    }}
                  >
                    {pct != null
                      ? `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`
                      : "-"}
                  </td>
                </tr>
              );
            })}
            {totals &&
              (() => {
                const prevTotal = parseFloat(totals.previous) || 0;
                const currTotal = parseFloat(totals.current) || 0;
                const totalPct =
                  prevTotal != 0
                    ? ((currTotal - prevTotal) / prevTotal) * 100
                    : null;
                return (
                  <tr style={styles.totalRow}>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      GRAND TOTAL
                    </td>
                    <td style={styles.tdRight}>
                      {formatAmount(totals.previous)}
                    </td>
                    <td style={styles.tdRight}>
                      {formatAmount(totals.current)}
                    </td>
                    <td
                      style={{
                        ...styles.tdRight,
                        color:
                          totalPct != null
                            ? totalPct >= 0
                              ? "#16a34a"
                              : "#dc2626"
                            : undefined,
                      }}
                    >
                      {totalPct != null
                        ? `${totalPct >= 0 ? "+" : ""}${totalPct.toFixed(2)}%`
                        : "-"}
                    </td>
                  </tr>
                );
              })()}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {showPrint && (
        <PrintLayout
          title="Department-wise Budget Comparison"
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
              <RiFileExcel2Line className="h-4 w-4 mr-2" /> Excel
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
              Budget Yearly Comparision Report
            </h2>
            {hasGenerated && (
              <p className="text-center text-sm text-gray-500 mt-1">
                {prevLabel} vs {currLabel}
              </p>
            )}
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex gap-3 items-end">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <FiCheck className="h-4 w-4 mr-2" />
                Generate Report
              </button>
              {hasGenerated && (
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

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading comparison data...</p>
            </div>
          )}

          {!loading && message.type == "error" && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{message.text}</p>
            </div>
          )}

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
                  Click <strong>Generate Report</strong> to view budget yearly
                  comparison.
                </p>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No comparison data available.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                >
                  <FiX className="h-4 w-4 mr-2" /> Clear
                </button>
              </div>
            ))}

          {!loading && hasData && renderDataTable()}
        </div>
      </div>
    </div>
  );
};

export default BudgetComparison;
