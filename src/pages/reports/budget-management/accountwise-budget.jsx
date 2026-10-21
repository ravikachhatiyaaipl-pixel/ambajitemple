import React, { useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";

const GROUP_OPTIONS = [
  { value: "revenue_income", label: "Revenue Income" },
  { value: "revenue_expense", label: "Revenue Expense" },
  { value: "capital_income", label: "Capital Income" },
  { value: "capital_expense", label: "Capital Expense" },
];

const AccountwiseBudgetSummary = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [budgetData, setBudgetData] = useState(null);
  const [financialYear, setFinancialYear] = useState(null);
  const [totals, setTotals] = useState(null);
  const [pageTitle, setPageTitle] = useState("Account-wise Budget Summary");

  // Filter states
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [appliedFinancialYear, setAppliedFinancialYear] = useState("");
  const [selectedGroupName, setSelectedGroupName] = useState("all");
  const [appliedGroupName, setAppliedGroupName] = useState("all");
  const [hasGenerated, setHasGenerated] = useState(false);

  // Previous financial year state
  const [previousFinancialYear, setPreviousFinancialYear] = useState(null);

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();
  const { currentFinancialYear } = useFinancialYear();

  const currentFYLabel = currentFinancialYear?.FY_Code
    ? `Current (${currentFinancialYear.FY_Code})`
    : "Current Year";

  // Calculate previous financial year
  useEffect(() => {
    if (currentFinancialYear?.FY_Code) {
      const currentYear = currentFinancialYear.FY_Code;
      const years = currentYear.split("-");
      if (years.length == 2) {
        const startYear = parseInt(years[0]);
        const prevStartYear = startYear - 1;
        const prevEndYear = (prevStartYear + 1).toString().slice(-2);
        setPreviousFinancialYear({
          FY_Code: `${prevStartYear}-${prevEndYear}`,
          name: `Previous (${prevStartYear}-${prevEndYear})`,
        });
      }
    }
  }, [currentFinancialYear]);

  // Set default financial year to empty (All) when component mounts
  useEffect(() => {
    if (currentFinancialYear?.FY_Code && !selectedFinancialYear) {
      setSelectedFinancialYear("");
    }
  }, [currentFinancialYear]);

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/budget-management/accountwise-budget";
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

  // Fetch budget summary data from API with filters
  const fetchBudgetData = async (financialYearFilter = "") => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}/budget-reports/summary-group-wise`;
      const params = new URLSearchParams();

      if (financialYearFilter) {
        params.append("fy", financialYearFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url,
        { headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      if (response.data?.success) {
        setBudgetData(response.data.data || null);
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
        setBudgetData(null);
        setTotals(null);
      }
    } catch (err) {
      console.error("Error fetching budget data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading budget data",
        type: "error",
      });
      setBudgetData(null);
      setTotals(null);
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedFinancialYear("");
    setAppliedGroupName("all");
    setBudgetData(null);
    setTotals(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setSelectedFinancialYear("");
    setSelectedGroupName("all");
    invalidateReport();
  };

  const handleFinancialYearChange = (e) => {
    const next = e.target.value || "";
    setSelectedFinancialYear(next);
    if (hasGenerated) invalidateReport();
  };

  const handleGroupNameChange = (e) => {
    const next = e.target.value || "all";
    setSelectedGroupName(next);
    if (hasGenerated) invalidateReport();
  };

  const handleGenerateReport = async () => {
    const yearFilter = selectedFinancialYear || "";
    const groupFilter = selectedGroupName || "all";

    setAppliedFinancialYear(yearFilter);
    setAppliedGroupName(groupFilter);
    setHasGenerated(true);
    await fetchBudgetData(yearFilter);
  };

  // Function to determine section color based on section name
  const getSectionColor = (sectionName) => {
    if (!sectionName) return "bg-gray-100";
    const nameLower = sectionName.toLowerCase();
    if (
      nameLower.includes("income") ||
      nameLower.includes("revenue") ||
      nameLower.includes("આવક")
    ) {
      return "bg-green-100";
    }
    if (
      nameLower.includes("expense") ||
      nameLower.includes("expenditure") ||
      nameLower.includes("ખર્ચ")
    ) {
      return "bg-red-100";
    }
    return "bg-blue-100";
  };

  // Filter data by selected group value (section key)
  const filterDataByGroup = (data, groupValue) => {
    if (!groupValue || groupValue == "all" || !data) return data;
    const filtered = {};
    if (data[groupValue]) filtered[groupValue] = data[groupValue];
    return Object.keys(filtered).length > 0 ? filtered : null;
  };

  // Get all items for display - with group filter applied
  const getAllItems = () => {
    let dataToUse = budgetData;

    // Apply group filter if selected
    if (appliedGroupName && appliedGroupName != "all" && budgetData) {
      dataToUse = filterDataByGroup(budgetData, appliedGroupName);
    }

    if (!dataToUse) return [];

    const allItems = [];
    const yearMode = appliedFinancialYear || "";

    // Process all sections dynamically
    Object.entries(dataToUse).forEach(([sectionKey, sectionData]) => {
      if (!sectionData?.groups || sectionData.groups.length == 0) return;

      const sectionName = sectionData.groups[0]?.main_group_name || sectionKey;
      const sectionColor = getSectionColor(sectionName);

      // Add section header
      allItems.push({
        isHeader: true,
        sectionName: sectionName,
        sectionKey: sectionKey,
        group_name: sectionName,
        previous_amount: null,
        current_amount: null,
        sectionColor: sectionColor,
      });

      // Add sub groups
      sectionData.groups.forEach((group) => {
        group.sub_groups?.forEach((subGroup) => {
          let displayAmount = null;
          if (yearMode == "previous") {
            displayAmount = subGroup.previous_amount;
          } else if (yearMode == "current") {
            displayAmount = subGroup.current_amount;
          }

          allItems.push({
            ...subGroup,
            isHeader: false,
            section_key: sectionKey,
            section_display: sectionName,
            main_group_code: group.main_group_code,
            main_group_name: group.main_group_name,
            sectionColor: sectionColor,
            display_amount: displayAmount,
            yearMode: yearMode,
          });
        });
      });

      // Add section total
      if (
        sectionData.total &&
        (sectionData.total.previous != undefined ||
          sectionData.total.current != undefined)
      ) {
        let totalAmount = null;
        if (yearMode == "previous") {
          totalAmount = sectionData.total.previous;
        } else if (yearMode == "current") {
          totalAmount = sectionData.total.current;
        }

        allItems.push({
          isTotal: true,
          sectionKey: sectionKey,
          sectionName: sectionName,
          previous_amount: sectionData.total.previous,
          current_amount: sectionData.total.current,
          sectionColor: sectionColor,
          display_amount: totalAmount,
          yearMode: yearMode,
        });
      }
    });

    return allItems;
  };

  const allItems = getAllItems();

  // Format amount
  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || isNaN(amount)) return "";

    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return "";
      return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (error) {
      return "";
    }
  };

  // Get indentation level from group_name
  const getIndentLevel = (groupName) => {
    if (!groupName || typeof groupName != "string") return 0;
    const match = groupName.match(/^\s*/);
    if (!match) return 0;
    const leadingSpaces = match[0].length;
    return Math.floor(leadingSpaces / 2);
  };

  // Render account name with proper indentation
  const renderAccountName = (item) => {
    if (item.isHeader) {
      return (
        <span className="font-bold text-gray-900 text-base">
          {item.sectionName}
        </span>
      );
    }

    if (item.isTotal) {
      return (
        <span className="font-semibold text-gray-900">{item.group_name}</span>
      );
    }

    const indentLevel = getIndentLevel(item.group_name);
    return (
      <span
        style={{ marginLeft: `${indentLevel * 20}px` }}
        className="block whitespace-pre-wrap text-gray-900"
      >
        {item.group_name?.trim() || item.sub_group_name}
      </span>
    );
  };

  // Get financial year display label
  const getFinancialYearLabel = (yearType) => {
    if (yearType == "current") {
      return currentFYLabel;
    } else if (yearType == "previous") {
      return previousFinancialYear?.FY_Code
        ? `Previous (${previousFinancialYear.FY_Code})`
        : "Previous Year";
    }
    return "";
  };

  // Get the appropriate column label for single year mode
  const getSingleYearColumnLabel = () => {
    if (appliedFinancialYear == "previous") {
      return previousFinancialYear?.FY_Code
        ? `Amount (${previousFinancialYear.FY_Code})`
        : "Amount (Previous Year)";
    } else if (appliedFinancialYear == "current") {
      return currentFYLabel;
    }
    return "";
  };

  // Render filters section - All in one row
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Year
            </label>
            <select
              value={selectedFinancialYear}
              onChange={handleFinancialYearChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All (Both Years)</option>
              <option value="current">{currentFYLabel}</option>
              {previousFinancialYear && (
                <option value="previous">
                  Previous ({previousFinancialYear.FY_Code})
                </option>
              )}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Group Name
            </label>
            <select
              value={selectedGroupName}
              onChange={handleGroupNameChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Groups</option>
              {GROUP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              title="Generate Report"
            >
              <FiCheck className="h-4 w-4 mr-2" />
              Generate Report
            </button>

            {(hasGenerated ||
              appliedFinancialYear ||
              appliedGroupName != "all") && (
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center transition-colors"
              >
                <FiX className="h-4 w-4 mr-2" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Print Report Content
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
      title: {
        fontSize: "18px",
        fontWeight: "bold",
        margin: "5px 0",
      },
      filterInfo: {
        marginTop: "10px",
        marginBottom: "15px",
        padding: "8px",
        backgroundColor: "#f5f5f5",
        fontSize: "11px",
        display: "flex",
        justifyContent: "center",
        gap: "20px",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "15px",
      },
      th: {
        backgroundColor: "#f3f4f6",
        fontWeight: "bold",
        padding: "10px",
        border: "1px solid #d1d5db",
        textAlign: "left",
      },
      thRight: {
        backgroundColor: "#f3f4f6",
        fontWeight: "bold",
        padding: "10px",
        border: "1px solid #d1d5db",
        textAlign: "right",
        whiteSpace: "nowrap",
      },
      td: {
        padding: "8px 10px",
        border: "1px solid #d1d5db",
        verticalAlign: "top",
      },
      textRight: {
        textAlign: "right",
        whiteSpace: "nowrap",
      },
      headerRow: {
        backgroundColor: "#e5e7eb",
        fontWeight: "bold",
      },
      totalRow: {
        backgroundColor: "#f9fafb",
        fontWeight: "bold",
        borderTop: "2px solid #9ca3af",
      },
    };

    const printItems = getAllItems();
    const yearMode = appliedFinancialYear || "";
    const showBothColumns = !yearMode;

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <div style={styles.filterInfo}>
            {appliedFinancialYear && (
              <span>
                Financial Year: {getFinancialYearLabel(appliedFinancialYear)}
              </span>
            )}
            {appliedGroupName != "all" && (
              <span>Group: {appliedGroupName}</span>
            )}
            {(!appliedFinancialYear || appliedGroupName == "all") &&
              !appliedFinancialYear && <span>All Groups & Both Years</span>}
          </div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Account Name</th>
              {showBothColumns ? (
                <>
                  <th style={styles.thRight}>
                    Previous (
                    {financialYear?.previous_budget?.name ||
                      previousFinancialYear?.FY_Code}
                    )
                  </th>
                  <th style={styles.thRight}>
                    Current (
                    {financialYear?.current_budget?.name ||
                      currentFinancialYear?.FY_Code}
                    )
                  </th>
                </>
              ) : (
                <th style={styles.thRight}>{getSingleYearColumnLabel()}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {printItems.map((item, index) => {
              let rowStyle = {};
              if (item.isHeader) {
                rowStyle = styles.headerRow;
              } else if (item.isTotal) {
                rowStyle = styles.totalRow;
              }

              let backgroundColor = {};
              if (item.isHeader) {
                const colorMap = {
                  "bg-green-100": "#dcfce7",
                  "bg-red-100": "#fee2e2",
                  "bg-blue-100": "#FFCDD2",
                };
                const colorClass = item.sectionColor || "bg-blue-100";
                backgroundColor = {
                  backgroundColor: colorMap[colorClass] || "#FFCDD2",
                };
              }

              return (
                <tr key={index} style={{ ...rowStyle, ...backgroundColor }}>
                  <td
                    style={{
                      ...styles.td,
                      textAlign: item.isTotal ? "center" : "left",
                    }}
                  >
                    {renderAccountName(item)}
                  </td>
                  {showBothColumns ? (
                    <>
                      <td style={{ ...styles.td, ...styles.textRight }}>
                        {item.previous_amount != null &&
                        item.previous_amount != undefined
                          ? formatAmount(item.previous_amount)
                          : ""}
                      </td>
                      <td style={{ ...styles.td, ...styles.textRight }}>
                        {item.current_amount != null &&
                        item.current_amount != undefined
                          ? formatAmount(item.current_amount)
                          : ""}
                      </td>
                    </>
                  ) : (
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {item.display_amount != null &&
                      item.display_amount != undefined
                        ? formatAmount(item.display_amount)
                        : yearMode == "previous"
                          ? item.previous_amount != undefined
                            ? formatAmount(item.previous_amount)
                            : ""
                          : item.current_amount != undefined
                            ? formatAmount(item.current_amount)
                            : ""}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500">Loading budget data...</p>
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
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">
          Select Financial Year and click Generate Report
        </p>
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Budget Data Found
        </h3>
        <p className="text-gray-600 mb-4">
          No budget data available for the selected filters.
        </p>
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center transition-colors"
        >
          <FiX className="h-4 w-4 mr-2" />
          Clear Filters
        </button>
      </div>
    );

  // Render data table
  const renderDataTable = () => {
    const yearMode = appliedFinancialYear || "";
    const showBothColumns = !yearMode;

    if (allItems.length == 0) {
      return renderNoData();
    }

    return (
      <div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Name
                </th>
                {showBothColumns ? (
                  <>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Previous (
                      {financialYear?.previous_budget?.name ||
                        previousFinancialYear?.FY_Code}
                      )
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Current (
                      {financialYear?.current_budget?.name ||
                        currentFinancialYear?.FY_Code}
                      )
                    </th>
                  </>
                ) : (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {getSingleYearColumnLabel()}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allItems.map((item, idx) => {
                let rowClassName = "";
                if (item.isHeader) {
                  rowClassName = `${item.sectionColor} font-bold`;
                } else if (item.isTotal) {
                  const totalColor =
                    item.sectionColor?.replace("100", "50") || "bg-gray-50";
                  rowClassName = `${totalColor} font-semibold border-t-2 border-gray-300`;
                } else {
                  rowClassName = idx % 2 == 0 ? "bg-white" : "bg-gray-50";
                }

                return (
                  <tr
                    key={idx}
                    className={`${rowClassName} hover:bg-gray-100 transition-colors`}
                  >
                    <td
                      className={`px-4 py-2 text-sm whitespace-pre-wrap break-words text-gray-900 ${item.isTotal ? "text-center" : ""}`}
                    >
                      {renderAccountName(item)}
                    </td>
                    {showBothColumns ? (
                      <>
                        <td className="px-4 py-2 text-sm text-right font-mono text-gray-900 align-middle whitespace-nowrap">
                          {item.previous_amount != null &&
                          item.previous_amount != undefined
                            ? formatAmount(item.previous_amount)
                            : ""}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-mono text-gray-900 align-middle whitespace-nowrap">
                          {item.current_amount != null &&
                          item.current_amount != undefined
                            ? formatAmount(item.current_amount)
                            : ""}
                        </td>
                      </>
                    ) : (
                      <td className="px-4 py-2 text-sm text-right font-mono text-gray-900 align-middle whitespace-nowrap">
                        {item.display_amount != null &&
                        item.display_amount != undefined
                          ? formatAmount(item.display_amount)
                          : yearMode == "previous"
                            ? item.previous_amount != undefined
                              ? formatAmount(item.previous_amount)
                              : ""
                            : item.current_amount != undefined
                              ? formatAmount(item.current_amount)
                              : ""}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const hasData = budgetData != null && allItems.length > 0;

  const handleExportExcel = () => {
    const yearMode = appliedFinancialYear || "";
    const showBothColumns = !yearMode;
    const fyLabel = getFinancialYearLabel(appliedFinancialYear);

    const headers = showBothColumns
      ? [
          "Account Name",
          `Previous (${financialYear?.previous_budget?.name || previousFinancialYear?.FY_Code || ""})`,
          `Current (${financialYear?.current_budget?.name || currentFinancialYear?.FY_Code || ""})`,
        ]
      : ["Account Name", getSingleYearColumnLabel()];

    const rows = allItems.map((item) => {
      const name = item.isHeader
        ? item.sectionName
        : item.isTotal
          ? `Total ${item.sectionName}`
          : `${" ".repeat(getIndentLevel(item.group_name) * 2)}${item.group_name?.trim() || item.sub_group_name || ""}`;

      if (showBothColumns) {
        return [
          name,
          item.previous_amount != null && item.previous_amount != undefined
            ? parseFloat(item.previous_amount) || 0
            : "",
          item.current_amount != null && item.current_amount != undefined
            ? parseFloat(item.current_amount) || 0
            : "",
        ];
      } else {
        const amt =
          item.display_amount != null && item.display_amount != undefined
            ? item.display_amount
            : yearMode == "previous"
              ? item.previous_amount
              : item.current_amount;
        return [
          name,
          amt != null && amt != undefined ? parseFloat(amt) || 0 : "",
        ];
      }
    });

    const sheetData = [
      [pageTitle],
      fyLabel ? [`Financial Year: ${fyLabel}`] : [],
      appliedGroupName != "all" ? [`Group: ${appliedGroupName}`] : [],
      [],
      headers,
      ...rows,
    ].filter((r) => r.length > 0);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Budget Summary");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `accountwise_budget_${fyLabel || "report"}.xlsx`,
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {showPrint && (
        <PrintLayout
          title={`${pageTitle}${appliedGroupName != "all" ? ` - ${appliedGroupName}` : ""}`}
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
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
              title="Export to Excel"
            >
              <FileText className="h-4 w-4 mr-2" /> Excel
            </button>
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!hasData || loading}
              title="Print Report"
            >
              <FiPrinter className="h-4 w-4 mr-2" /> Print
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          {/* Header with title */}
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

export default AccountwiseBudgetSummary;
