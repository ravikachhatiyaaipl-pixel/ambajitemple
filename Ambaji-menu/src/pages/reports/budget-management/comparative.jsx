import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiX,
  FiPrinter,
  FiFileText,
  FiFilter,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const BudgetComparative = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [comparativeData, setComparativeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [financialYears, setFinancialYears] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [pageTitle, setPageTitle] = useState("Budget Comparative Report");

  // Filter states
  const [filters, setFilters] = useState({
    fin_year_id: "",
    dept_id: "",
    ledg_id: "",
    status: "",
    show_only_latest: false,
    include_version_history: false,
    sort_by: "department_name",
    sort_order: "asc",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Print and Export states
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");
  const [reportType, setReportType] = useState("complete");

  const { organization } = useOrganization();

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/budget-management/comparative";
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

  // Fetch comparative data
  const fetchComparativeData = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Add filters
      if (filters.fin_year_id) params.append("fin_year", filters.fin_year_id); // Send ID as integer
      if (filters.dept_id) params.append("dept_id", filters.dept_id);
      if (filters.ledg_id) params.append("ledg_id", filters.ledg_id);
      if (filters.status) params.append("status", filters.status);
      if (filters.show_only_latest) params.append("show_only_latest", "true");
      if (filters.include_version_history)
        params.append("include_version_history", "true");

      // Add sorting
      if (filters.sort_by) params.append("sort_by", filters.sort_by);
      if (filters.sort_order) params.append("sort_order", filters.sort_order);

      // Add pagination
      params.append("page", page);
      params.append("per_page", itemsPerPage);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/budget-reports/comparative?${params.toString()}`,
       { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      if (response.data?.success) {
        setComparativeData(response.data.data || []);
        setFilteredData(response.data.data || []);
        setSummary(response.data.summary || null);
        setPagination(response.data.pagination || null);

        // Extract financial years with proper structure
        if (response.data.financial_years) {
          setFinancialYears(response.data.financial_years);
        } else {
          // If financial_years not directly available, create from data
          const yearsMap = new Map();
          response.data.data?.forEach((item) => {
            if (item.financial_year_id && item.financial_year) {
              yearsMap.set(item.financial_year_id, {
                financial_year_id: item.financial_year_id,
                financial_year_name: item.financial_year,
                financial_year_code: item.financial_year,
              });
            }
          });
          setFinancialYears(Array.from(yearsMap.values()));
        }

        setMessage({
          text: response.data.message || "Data loaded successfully",
          type: "success",
        });
      } else {
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
        setComparativeData([]);
        setFilteredData([]);
        setSummary(null);
        setPagination(null);
      }
    } catch (err) {
      console.error("Error fetching comparative data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading comparative data",
        type: "error",
      });
      setComparativeData([]);
      setFilteredData([]);
      setSummary(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchComparativeData(1);
  }, []);

  // Filter data when search changes
  useEffect(() => {
    filterData();
  }, [comparativeData, searchQuery]);

  const filterData = useCallback(() => {
    if (!comparativeData.length) {
      setFilteredData([]);
      return;
    }

    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) {
      setFilteredData(comparativeData);
      return;
    }

    const filtered = comparativeData.filter(
      (item) =>
        item.department_name?.toLowerCase().includes(searchLower) ||
        item.title?.toLowerCase().includes(searchLower) ||
        item.account_head?.toLowerCase().includes(searchLower) ||
        item.account_name?.toLowerCase().includes(searchLower),
    );

    setFilteredData(filtered);
  }, [comparativeData, searchQuery]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type == "checkbox" ? checked : value,
    }));
  };

  const handleSortChange = (field) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: field,
      sort_order:
        prev.sort_by == field && prev.sort_order == "asc" ? "desc" : "asc",
    }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchComparativeData(1);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      fin_year_id: "", // Change from fin_year to fin_year_id
      dept_id: "",
      ledg_id: "",
      status: "",
      show_only_latest: false,
      include_version_history: false,
      sort_by: "department_name",
      sort_order: "asc",
    });
    setCurrentPage(1);
    fetchComparativeData(1);
    setShowFilters(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchComparativeData(page);
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

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // =========  PAGINATION VARIABLES ==========
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  // ==========================================

  const formatCurrency = (amount) => {
    if (amount == undefined || amount == null) return "₹ 0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).replace("₹", "₹ ");
  };

  const getChangeColor = (percentage) => {
    if (percentage > 0) return "text-green-600";
    if (percentage < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "R":
        return "bg-blue-100 text-blue-800";
      case "RR":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (filteredData.length == 0) {
      setMessage({ text: "No data to export", type: "error" });
      return;
    }

    try {
      setLoading(true);
      const wb = XLSX.utils.book_new();

      // Summary Sheet
      const summarySheetData = [
        {
          "Report Type": pageTitle,
          "Report Generated": new Date().toLocaleString(),
          "Total Records": filteredData.length,
        },
        {},
        { "Filters Applied": "" },
      ];

      if (filters.fin_year_id) {
        const selectedYear = financialYears.find(
          (y) => y.financial_year_id == filters.fin_year_id,
        );
        summarySheetData.push({
          "Financial Year":
            selectedYear?.financial_year_name || filters.fin_year_id,
        });
      }
      if (filters.status) summarySheetData.push({ Status: filters.status });
      if (filters.show_only_latest)
        summarySheetData.push({ "Show Only Latest": "Yes" });

      summarySheetData.push({}, { "Budget Comparative Details": "" });

      filteredData.forEach((item) => {
        summarySheetData.push({
          "Department Name": item.department_name,
          Title: item.title || "-",
          "Account Head": item.account_head,
          "Previous Year":
            item.formatted_previous_year_budget_approved ||
            formatCurrency(item.previous_year_budget_approved),
          "Current Proposed":
            item.formatted_current_year_proposed ||
            formatCurrency(item.current_year_proposed),
          "Budget Approved":
            item.formatted_budget_approved ||
            formatCurrency(item.budget_approved),
          Status: item.status_text || item.status,
          "Change %": `${item.percentage_change || 0}%`,
        });
      });

      const summaryWs = XLSX.utils.json_to_sheet(summarySheetData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      // Details Sheet
      const detailsData = [
        [
          "Department Name",
          "Title",
          "Account Head",
          "Previous Year Budget Approved",
          "Current Year Proposed",
          "Budget Approved",
          "Status",
          "Revision Date",
          "Change %",
        ],
      ];

      filteredData.forEach((item) => {
        detailsData.push([
          item.department_name,
          item.title || "",
          item.account_head,
          item.formatted_previous_year_budget_approved ||
            formatCurrency(item.previous_year_budget_approved),
          item.formatted_current_year_proposed ||
            formatCurrency(item.current_year_proposed),
          item.formatted_budget_approved ||
            formatCurrency(item.budget_approved),
          item.status_text || item.status,
          item.revision_date || "",
          `${item.percentage_change || 0}%`,
        ]);
      });

      // Add summary row
      if (summary) {
        detailsData.push([]);
        detailsData.push(["SUMMARY"]);
        detailsData.push(["Total Records", summary.total_records || 0]);
        detailsData.push([
          "Total Previous Year Approved",
          summary.formatted_total_previous_year_approved,
        ]);
        detailsData.push([
          "Total Current Year Proposed",
          summary.formatted_total_current_year_proposed,
        ]);
        detailsData.push([
          "Total Budget Approved",
          summary.formatted_total_budget_approved,
        ]);
        detailsData.push(["Total Change", summary.formatted_total_change]);
        detailsData.push([
          "Total Change %",
          `${summary.total_change_percentage || 0}%`,
        ]);
      }

      const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);

      // Set column widths
      const colWidths = [
        { wch: 25 }, // Department
        { wch: 30 }, // Title
        { wch: 40 }, // Account Head
        { wch: 20 }, // Previous Year
        { wch: 20 }, // Current Year Proposed
        { wch: 20 }, // Budget Approved
        { wch: 12 }, // Status
        { wch: 20 }, // Revision Date
        { wch: 10 }, // Change %
      ];
      detailsWs["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, detailsWs, "Budget Comparative");

      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const filename = `Budget_Comparative_${dateStamp}.xlsx`;
      XLSX.writeFile(wb, filename);

      setMessage({
        text: "Excel report downloaded successfully!",
        type: "success",
      });
    } catch (error) {
      setMessage({
        text: "Error creating Excel file: " + error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Print Report Content
  const PrintReportContent = () => {
    const styles = {
      section: { marginBottom: "20px", pageBreakInside: "avoid" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "8px 12px",
        margin: "10px 0",
        fontWeight: "600",
        borderLeft: "3px solid #EF5350",
        fontSize: "14px",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "8px 0",
        fontSize: "10px",
      },
      th: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "6px 8px",
        border: "1px solid #cbd5e0",
        textAlign: "left",
      },
      td: {
        padding: "4px 6px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textRight: { textAlign: "right" },
      positive: { color: "#059669" },
      negative: { color: "#dc2626" },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        <div style={styles.section}>
          <div style={{ ...styles.sectionTitle, backgroundColor: "#FFCDD2" }}>
            {pageTitle}
          </div>

          {/* Data Table */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Account Head</th>
                <th style={{ ...styles.th, textAlign: "right" }}>
                  Previous Year
                </th>
                <th style={{ ...styles.th, textAlign: "right" }}>
                  Current Proposed
                </th>
                <th style={{ ...styles.th, textAlign: "right" }}>
                  Budget Approved
                </th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Change %</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.budg_id}>
                  <td style={styles.td}>
                    <div>{item.department_name}</div>
                  </td>
                  <td style={styles.td}>{item.title || "-"}</td>
                  <td style={styles.td}>{item.account_head}</td>
                  <td style={{ ...styles.td, ...styles.textRight }}>
                    {item.formatted_previous_year_budget_approved}
                  </td>
                  <td style={{ ...styles.td, ...styles.textRight }}>
                    {item.formatted_current_year_proposed}
                  </td>
                  <td style={{ ...styles.td, ...styles.textRight }}>
                    {item.formatted_budget_approved}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        backgroundColor:
                          item.status == "R" ? "#FFCDD2" : "#f3e8ff",
                        color: item.status == "R" ? "#B71C1C" : "#6b21a8",
                        padding: "2px 6px",
                        borderRadius: "12px",
                        fontSize: "9px",
                        fontWeight: "500",
                      }}
                    >
                      {item.status_text || item.status}
                    </span>
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      ...styles.textRight,
                      color:
                        item.percentage_change > 0
                          ? "#059669"
                          : item.percentage_change < 0
                            ? "#dc2626"
                            : "#4b5563",
                      fontWeight:
                        item.percentage_change != 0 ? "500" : "normal",
                    }}
                  >
                    {item.percentage_change > 0 ? "+" : ""}
                    {item.percentage_change || 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Sort Icon Component
  const SortIcon = ({ field }) => {
    if (filters.sort_by != field) return null;
    return filters.sort_order == "asc" ? (
      <FiArrowUp className="inline ml-1 h-3 w-3" />
    ) : (
      <FiArrowDown className="inline ml-1 h-3 w-3" />
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
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

      <div className="px-2 py-6">
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
              disabled={filteredData.length == 0}
            >
              <FiPrinter className="h-4 w-4 mr-2" /> Print
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
              disabled={filteredData.length == 0}
            >
              <FiFileText className="h-4 w-4 mr-2" /> Excel
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 whitespace-nowrap">
              {pageTitle}
            </h2>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <FiFilter className="h-4 w-4 mr-2" /> Filters
                  {Object.values(filters).some(
                    (v) => v && v != "" && v != false,
                  ) && (
                    <span className="ml-2 flex-shrink-0 bg-blue-100 text-blue-800 rounded-full w-2 h-2"></span>
                  )}
                </button>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  title="Reset Filters"
                >
                  <FiRefreshCw className="h-4 w-4" />
                </button>
                <div className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-2 rounded-lg border border-blue-200 whitespace-nowrap">
                  <span className="font-semibold">
                    {pagination?.total || filteredData.length}
                  </span>{" "}
                  Records
                </div>
              </div>

              <div className="relative min-w-[280px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by department, title, account..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FiX className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="border-t pt-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Financial Year
                  </label>
                  <select
                    name="fin_year_id"
                    value={filters.fin_year_id}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Years</option>
                    {financialYears.map((year) => (
                      <option
                        key={year.financial_year_id}
                        value={year.financial_year_id}
                      >
                        {year.financial_year_name} ({year.financial_year_code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="R">Revised (R)</option>
                    <option value="RR">Re-Revised (RR)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <th
                    className="p-3 border border-gray-200 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange("department_name")}
                  >
                    Department <SortIcon field="department_name" />
                  </th>
                  <th className="p-3 border border-gray-200">Title</th>
                  <th
                    className="p-3 border border-gray-200 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange("ledger_name")}
                  >
                    Account Head <SortIcon field="ledger_name" />
                  </th>
                  <th className="p-3 border border-gray-200 text-right">
                    Previous Year
                  </th>
                  <th className="p-3 border border-gray-200 text-right">
                    Current Proposed
                  </th>
                  <th className="p-3 border border-gray-200 text-right">
                    Budget Approved
                  </th>
                  <th className="p-3 border border-gray-200 text-center">
                    Status
                  </th>
                  <th
                    className="p-3 border border-gray-200 text-right cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSortChange("revision_amount")}
                  >
                    Change % <SortIcon field="revision_amount" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading data...</p>
                    </td>
                  </tr>
                ) : currentItems.length == 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 bg-gray-50">
                      <div className="flex flex-col items-center">
                        <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchQuery
                            ? "No records found matching your search."
                            : "No comparative data available."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => {
                    const changePercent = item.percentage_change || 0;
                    return (
                      <tr
                        key={item.budg_id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="p-3 border border-gray-200 text-sm">
                          <div className="font-medium">
                            {item.department_name}
                          </div>
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {item.title || "-"}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          <div>{item.account_head}</div>
                          {item.account_name &&
                            item.account_name != item.account_head && (
                              <div className="text-xs text-gray-500">
                                {item.account_name}
                              </div>
                            )}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right">
                          {item.formatted_previous_year_budget_approved}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right font-medium text-blue-600">
                          {item.formatted_current_year_proposed}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right font-medium text-green-600">
                          {item.formatted_budget_approved}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}
                          >
                            {item.status_text || item.status}
                          </span>
                          {item.is_latest && (
                            <span className="ml-1 text-xs text-green-600">
                              ●
                            </span>
                          )}
                        </td>
                        <td
                          className={`p-3 border border-gray-200 text-sm text-right font-medium ${getChangeColor(changePercent)}`}
                        >
                          {changePercent > 0 ? "+" : ""}
                          {changePercent}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Summary Footer */}
              {!loading && currentItems.length > 0 && summary && (
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <td
                      colSpan="3"
                      className="p-3 border border-gray-200 text-sm"
                    >
                      Total ({pagination?.total || filteredData.length} records)
                    </td>
                    <td className="p-3 border border-gray-200 text-sm text-right">
                      {summary.formatted_total_previous_year_approved}
                    </td>
                    <td className="p-3 border border-gray-200 text-sm text-right">
                      {summary.formatted_total_current_year_proposed}
                    </td>
                    <td className="p-3 border border-gray-200 text-sm text-right">
                      {summary.formatted_total_budget_approved}
                    </td>
                    <td
                      colSpan="2"
                      className="p-3 border border-gray-200 text-sm text-right"
                    >
                      <span
                        className={
                          summary.total_change > 0
                            ? "text-green-600"
                            : summary.total_change < 0
                              ? "text-red-600"
                              : ""
                        }
                      >
                        {summary.formatted_total_change}
                        <span className="text-xs ml-1">
                          ({summary.total_change_percentage > 0 ? "+" : ""}
                          {summary.total_change_percentage}%)
                        </span>
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredData.length)} of{" "}
                {filteredData.length} records
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage == 1 || loading}
                  className={`p-2 rounded-md ${
                    currentPage == 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-100"
                  } transition-colors`}
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          currentPage == page
                            ? "bg-blue-600 text-white"
                            : "text-blue-600 hover:bg-blue-100"
                        } transition-colors`}
                        disabled={loading}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage == totalPages || loading}
                  className={`p-2 rounded-md ${
                    currentPage == totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-100"
                  } transition-colors`}
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetComparative;
