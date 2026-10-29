import React, { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiX,
  FiDownload,
  FiPrinter,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const BudgetWorkPlanning = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [budgetData, setBudgetData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [pageTitle, setPageTitle] = useState("Budget Work Planning Report");

  // Department selection
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptSearchQuery, setDeptSearchQuery] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownListRef = useRef(null);

  // Financial year states
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFY, setSelectedFY] = useState(null);

  // Report data states
  const [reportTitle, setReportTitle] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [summaryData, setSummaryData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  // Print states
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/budget-management/workplanning";
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

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
    fetchFinancialYears();
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDeptDropdown(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data when department and FY are selected
  useEffect(() => {
    if (selectedDept && selectedFY) {
      fetchBudgetReport();
    }
  }, [selectedDept, selectedFY]);

  // Filter data based on search
  useEffect(() => {
    filterData();
  }, [budgetData, searchQuery]);

  // Reset highlighted index when search query changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [deptSearchQuery]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownListRef.current) {
      const highlightedElement =
        dropdownListRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );
      if (response.data.success) {
        setDepartments(response.data.data);
        console.log("Departments loaded:", response.data.data); // Debug log
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setMessage({ text: "Failed to load departments", type: "error" });
    }
  };

  const fetchFinancialYears = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/fy-master`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );
      if (response.data.success && response.data.data.length > 0) {
        setFinancialYears(response.data.data);
        // Set current financial year as default
        const currentFY = response.data.data.find(
          (year) => year.is_current_year,
        );
        if (currentFY) {
          setSelectedFY({
            id: currentFY.FY_Id,
            name: currentFY.FY_Name,
            code: currentFY.FY_Code,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching financial years:", err);
    }
  };

  const fetchBudgetReport = async () => {
    if (!selectedDept || !selectedFY) return;

    setLoading(true);
    try {
      // Send dept_id as query parameter
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/budget-reports/department-budget-expenditure`,
        {
          params: {
            dept_id: selectedDept.id,
            fin_year: selectedFY.id,
          },
          headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` }
        },
      );

      console.log("API Response:", response.data); // Debug log

      if (response.data.success) {
        setReportTitle(response.data.report_title);
        setReportDate(response.data.report_date);

        // The data is directly in response.data.data array
        if (response.data.data && response.data.data.length > 0) {
          // Process the data array directly - REMOVED workOrderNo
          const processedData = response.data.data.map((item, index) => ({
            id: `${item.account_head || item.ledger_name}_${index}`,
            accountHead: item.account_head || item.ledger_name || "N/A",
            budgetApproved: item.budget_approved || 0,
            formattedBudgetApproved: item.formatted_budget_approved || "₹ 0.00",
            // workOrderNo removed
            workOrderAmount: item.work_order_amount || 0,
            formattedWorkOrderAmount:
              item.formatted_work_order_amount || "₹ 0.00",
            usedBudget: item.total_used_budget || 0,
            formattedUsedBudget: item.formatted_total_used_budget || "₹ 0.00",
            balanceBudget: item.balance_budget || 0,
            formattedBalanceBudget: item.formatted_balance_budget || "₹ 0.00",
            paymentCount: item.payment_count || 0,
            utilizationPercentage: item.utilization_percentage || 0,
            status: item.status || "",
            statusText: item.status_text || "",
          }));

          setBudgetData(processedData);
          setFilteredData(processedData);

          // Rest of the code remains the same...
          // Set summary data from response.data.summary
          if (response.data.summary) {
            setSummaryData({
              total_accounts: response.data.summary.total_accounts || 0,
              total_budget_approved:
                response.data.summary.total_budget_approved || 0,
              formatted_total_budget_approved:
                response.data.summary.formatted_total_budget_approved ||
                "₹ 0.00",
              total_work_order_amount:
                response.data.summary.total_work_order_amount || 0,
              formatted_total_work_order_amount:
                response.data.summary.formatted_total_work_order_amount ||
                "₹ 0.00",
              total_used_budget: response.data.summary.total_used_budget || 0,
              formatted_total_used_budget:
                response.data.summary.formatted_total_used_budget || "₹ 0.00",
              total_balance_budget:
                response.data.summary.total_balance_budget || 0,
              formatted_total_balance_budget:
                response.data.summary.formatted_total_balance_budget ||
                "₹ 0.00",
              total_work_orders: response.data.summary.total_work_orders || 0,
              utilization_percentage:
                response.data.summary.department_utilization_percentage || 0,
            });
          }

          // Set analysis data from response.data.analysis
          if (response.data.analysis) {
            setAnalysisData(response.data.analysis);
          }

          setMessage({
            text: `Loaded ${processedData.length} budget entries`,
            type: "success",
          });
        } else {
          // No data in the array
          setBudgetData([]);
          setFilteredData([]);
          setSummaryData(response.data.summary || null);
          setAnalysisData(response.data.analysis || null);
          setMessage({
            text: "No budget data available for selected department",
            type: "info",
          });
        }
      } else {
        setBudgetData([]);
        setFilteredData([]);
        setSummaryData(null);
        setAnalysisData(null);
        setMessage({
          text: response.data.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      console.error("Error fetching budget report:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading budget report",
        type: "error",
      });
      setBudgetData([]);
      setFilteredData([]);
      setSummaryData(null);
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (!budgetData.length) {
      setFilteredData([]);
      return;
    }

    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) {
      setFilteredData(budgetData);
      setCurrentPage(1);
      return;
    }

    const filtered = budgetData.filter(
      (item) => item.accountHead.toLowerCase().includes(searchLower),
      // workOrderNo removed from search
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Keyboard navigation handler for department dropdown
  const handleDeptKeyDown = (e) => {
    const filteredDepts = filteredDepartments;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (!showDeptDropdown) {
          // Open dropdown on Enter
          setShowDeptDropdown(true);
          setHighlightedIndex(-1);
          // Focus the search input after dropdown opens
          setTimeout(() => {
            if (searchInputRef.current) {
              searchInputRef.current.focus();
            }
          }, 100);
        } else if (highlightedIndex >= 0 && filteredDepts[highlightedIndex]) {
          // Select highlighted item
          selectDepartment(filteredDepts[highlightedIndex]);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!showDeptDropdown) {
          setShowDeptDropdown(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredDepts.length - 1 ? prev + 1 : prev,
          );
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (showDeptDropdown) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        }
        break;

      case "Escape":
        e.preventDefault();
        setShowDeptDropdown(false);
        setHighlightedIndex(-1);
        break;

      case "Tab":
        setShowDeptDropdown(false);
        setHighlightedIndex(-1);
        break;

      default:
        break;
    }
  };

  // Handle search input key down
  const handleSearchKeyDown = (e) => {
    const filteredDepts = filteredDepartments;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredDepts[highlightedIndex]) {
          selectDepartment(filteredDepts[highlightedIndex]);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredDepts.length - 1 ? prev + 1 : prev,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case "Escape":
        e.preventDefault();
        setShowDeptDropdown(false);
        setHighlightedIndex(-1);
        break;

      default:
        break;
    }
  };

  const selectDepartment = (dept) => {
    setSelectedDept({
      id: dept.Dpt_id,
      name: dept.Dpt_Name,
      gujName: dept.Dpt_Desc,
      code: dept.GrCod,
    });
    setShowDeptDropdown(false);
    setDeptSearchQuery("");
    setHighlightedIndex(-1);
  };

  // Add this after setting departments
  useEffect(() => {
    console.log("Current departments state:", departments);
  }, [departments]);

  const handleFYChange = (e) => {
    const fyId = parseInt(e.target.value);
    const selected = financialYears.find((fy) => fy.FY_Id == fyId);
    if (selected) {
      setSelectedFY({
        id: selected.FY_Id,
        name: selected.FY_Name,
        code: selected.FY_Code,
      });
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    if (!selectedDept || filteredData.length == 0) {
      setMessage({
        text: selectedDept ? "No data to export" : "Please select a department",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const wb = XLSX.utils.book_new();

      // Summary Sheet
      const summarySheetData = [
        {
          "Report Type": pageTitle,
          Department: selectedDept?.name || "N/A",
          "Department Code": selectedDept?.code || "N/A",
          "Financial Year": selectedFY?.name || "N/A",
          "Report Title": reportTitle,
          "Report Date": reportDate,
          "Report Generated": new Date().toLocaleString(),
        },
        {},
        {
          "Summary Metrics": "Value",
          "Total Accounts": summaryData?.total_accounts || 0,
          "Total Budget Approved":
            summaryData?.formatted_total_budget_approved || "₹ 0.00",
          "Total Work Order Amount":
            summaryData?.formatted_total_work_order_amount || "₹ 0.00",
          "Total Used Budget":
            summaryData?.formatted_total_used_budget || "₹ 0.00",
          "Total Balance Budget":
            summaryData?.formatted_total_balance_budget || "₹ 0.00",
          "Total Work Orders": summaryData?.total_work_orders || 0,
        },
        {},
        {
          Analysis: "Count",
          "High Utilization Accounts":
            analysisData?.high_utilization_accounts || 0,
          "Medium Utilization Accounts":
            analysisData?.medium_utilization_accounts || 0,
          "Low Utilization Accounts":
            analysisData?.low_utilization_accounts || 0,
          "Fully Utilized Accounts": analysisData?.fully_utilized_accounts || 0,
          "No Work Order Accounts": analysisData?.no_work_order_accounts || 0,
          "No Expenditure Accounts": analysisData?.no_expenditure_accounts || 0,
        },
      ];

      const summaryWs = XLSX.utils.json_to_sheet(summarySheetData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      // Details Sheet - REMOVED Work Order No column
      const detailsData = [
        [
          "Account Head",
          "Budget Approved",
          "Work Order Amount",
          "Total Used Budget",
          "Balance Budget",
        ],
      ];

      filteredData.forEach((item) => {
        detailsData.push([
          item.accountHead,
          item.formattedBudgetApproved,
          item.formattedWorkOrderAmount,
          item.formattedUsedBudget,
          item.formattedBalanceBudget,
        ]);
      });

      // Add summary row
      if (summaryData) {
        detailsData.push([
          "TOTALS",
          summaryData.formatted_total_budget_approved,
          summaryData.formatted_total_work_order_amount,
          summaryData.formatted_total_used_budget,
          summaryData.formatted_total_balance_budget,
        ]);
      }

      const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);

      // Set column widths - REMOVED Work Order No column
      const colWidths = [
        { wch: 40 }, // Account Head
        { wch: 18 }, // Budget Approved
        { wch: 20 }, // Work Order Amount
        { wch: 18 }, // Total Used Budget
        { wch: 18 }, // Balance Budget
      ];
      detailsWs["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, detailsWs, "Budget Details");

      // Generate filename
      const deptName = selectedDept.name.replace(/\s+/g, "_");
      const fyName = selectedFY.name.replace(/\s+/g, "_");
      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const filename = `Budget_Work_Planning_${deptName}_${fyName}_${dateStamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      setMessage({
        text: "Excel report downloaded successfully!",
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

  const PrintReportContent = () => {
    const styles = {
      section: { marginBottom: "15px", pageBreakInside: "avoid" },
      sectionTitle: {
        backgroundColor: "#f3f4f6",
        padding: "6px 8px",
        margin: "8px 0",
        fontWeight: "600",
        borderLeft: "3px solid #EF5350",
        fontSize: "12px",
        color: "#1f2937",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "6px 0",
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
        padding: "5px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textBold: { fontWeight: "600" },
      textRight: { textAlign: "right" },
    };

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Budget Details Table */}
        {filteredData.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              {pageTitle} - {filteredData.length} entries
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Account Head</th>
                  <th className="p-3 border border-[#cbd5e0] text-right bg-[#f1f5f9]">
                    Budget Approved
                  </th>
                  <th className="p-3 border border-[#cbd5e0] text-right bg-[#f1f5f9]">
                    Work Order Amount
                  </th>
                  <th className="p-3 border border-[#cbd5e0] text-right bg-[#f1f5f9]">
                    Used Budget
                  </th>
                  <th className="p-3 border border-[#cbd5e0] text-right bg-[#f1f5f9]">
                    Balance Budget
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.accountHead}</td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {item.formattedBudgetApproved}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {item.formattedWorkOrderAmount}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {item.formattedUsedBudget}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {item.formattedBalanceBudget}
                    </td>
                  </tr>
                ))}

                {/* Totals Row */}
                {summaryData && (
                  <tr style={{ backgroundColor: "#f9fafb", fontWeight: "600" }}>
                    <td style={{ ...styles.td, ...styles.textBold }}>
                      TOTALS:
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {summaryData.formatted_total_budget_approved}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {summaryData.formatted_total_work_order_amount}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {summaryData.formatted_total_used_budget}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {summaryData.formatted_total_balance_budget}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.Dpt_Name?.toLowerCase().includes(deptSearchQuery.toLowerCase()) ||
      dept.Dpt_Desc?.toLowerCase().includes(deptSearchQuery.toLowerCase()) ||
      dept.GrCod?.toLowerCase().includes(deptSearchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Print Layout Component */}
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
              <FiChevronLeft className="mr-1" />
              Back to Dashboard
            </button>
          </Link>
          <div className="w-24"></div>
        </div>

        {/* Header Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{pageTitle}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPrint(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
                disabled={!selectedDept || filteredData.length == 0}
              >
                <FiPrinter className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
                disabled={!selectedDept || filteredData.length == 0}
              >
                <FiFileText className="h-4 w-4 mr-2" />
                Excel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Selector with Keyboard Navigation */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Department <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                onKeyDown={handleDeptKeyDown}
                tabIndex={0}
                role="button"
                aria-haspopup="listbox"
                aria-expanded={showDeptDropdown}
                className="w-full border border-gray-300 rounded-md p-3 bg-white cursor-pointer hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {selectedDept ? (
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedDept.name}
                    </div>
                    {selectedDept.gujName && (
                      <div className="text-sm text-gray-600">
                        {selectedDept.gujName}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">Choose a department...</span>
                )}
              </div>

              {/* Department Dropdown */}
              {showDeptDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden">
                  <div className="p-2 border-b">
                    <div className="flex items-center border rounded-md px-3 py-2">
                      <FiSearch className="h-4 w-4 text-gray-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        className="ml-2 w-full focus:outline-none text-sm"
                        placeholder="Search departments..."
                        value={deptSearchQuery}
                        onChange={(e) => setDeptSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div
                    ref={dropdownListRef}
                    className="overflow-y-auto max-h-64"
                    role="listbox"
                  >
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((dept, index) => (
                        <div
                          key={dept.Dpt_id}
                          onClick={() => selectDepartment(dept)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                            highlightedIndex == index
                              ? "bg-blue-100"
                              : "hover:bg-blue-50"
                          }`}
                          role="option"
                          aria-selected={highlightedIndex == index}
                        >
                          <div className="font-medium text-gray-900">
                            {dept.Dpt_Name}
                          </div>
                          {dept.Dpt_Desc && (
                            <div className="text-sm text-gray-600">
                              {dept.Dpt_Desc}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No departments found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Financial Year Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Year <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedFY?.id || ""}
                onChange={handleFYChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select Financial Year</option>
                {financialYears.map((fy) => (
                  <option key={fy.FY_Id} value={fy.FY_Id}>
                    {fy.FY_Name} {fy.is_current_year ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Entries: {filteredData.length}
              </div>
              {selectedDept && selectedFY && (
                <div className="text-sm text-gray-600">
                  {selectedDept.name} - {selectedFY.name}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <div className="border bg-white rounded-md flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <FiSearch className="h-4 w-4 text-gray-400" />
                <input
                  className="border-0 focus:outline-none text-sm w-full px-2 py-1 bg-transparent"
                  placeholder="Search by account..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <th className="p-3 border border-gray-200">Account Head</th>
                  <th className="p-3 border border-gray-200 text-right">
                    Budget Approved
                  </th>
                  <th className="p-3 border border-gray-200 text-right">
                    Work Order Amount
                  </th>
                  <th className="p-3 border border-gray-200 text-right">
                    Total Used Budget
                  </th>
                  <th className="p-3 border border-gray-200 text-right">
                    Balance Budget
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">
                        Loading budget data...
                      </p>
                    </td>
                  </tr>
                ) : currentItems.length == 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 bg-gray-50">
                      <div className="flex flex-col items-center">
                        <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchQuery
                            ? "No entries found matching your search."
                            : !selectedDept || !selectedFY
                              ? "Please select department and financial year"
                              : "No budget data available for the selected criteria"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {currentItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="p-3 border border-gray-200 text-sm font-medium">
                          {item.accountHead}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right">
                          {item.formattedBudgetApproved}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right">
                          {item.formattedWorkOrderAmount}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right">
                          {item.formattedUsedBudget}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-right font-medium">
                          {item.formattedBalanceBudget}
                        </td>
                      </tr>
                    ))}

                    {/* Summary Row */}
                    {summaryData && (
                      <tr className="bg-gray-50 font-semibold">
                        <td className="p-3 border border-gray-200 text-right">
                          TOTALS:
                        </td>
                        <td className="p-3 border border-gray-200 text-right">
                          {summaryData.formatted_total_budget_approved}
                        </td>
                        <td className="p-3 border border-gray-200 text-right">
                          {summaryData.formatted_total_work_order_amount}
                        </td>
                        <td className="p-3 border border-gray-200 text-right">
                          {summaryData.formatted_total_used_budget}
                        </td>
                        <td className="p-3 border border-gray-200 text-right">
                          {summaryData.formatted_total_balance_budget}
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredData.length)} of{" "}
                {filteredData.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
                        onClick={() => setCurrentPage(page)}
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
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

export default BudgetWorkPlanning;
