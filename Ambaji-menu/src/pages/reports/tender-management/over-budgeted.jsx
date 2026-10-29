// import React, { useState, useEffect, useRef } from "react";
// import {
//   FiSearch,
//   FiChevronLeft,
//   FiChevronRight,
//   FiAlertCircle,
//   FiX,
//   FiPrinter,
//   FiFileText,
// } from "react-icons/fi";
// import axios from "axios";
// import * as XLSX from "xlsx";
// import { useNavigate } from "react-router-dom";
// import PrintLayout from "../../../components/printlayout";
// import { useOrganization } from "../../../hooks/useorganization";

// const OverBudgetedWorkOrder = () => {
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const [reportData, setReportData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 15;
//   const [pageTitle, setPageTitle] = useState("Over Budgeted Work Orders Report");

//   const navigate = useNavigate();

//   // Department selection
//   const [departments, setDepartments] = useState([]);
//   const [selectedDept, setSelectedDept] = useState(null);
//   const [deptSearchQuery, setDeptSearchQuery] = useState("");
//   const [showDeptDropdown, setShowDeptDropdown] = useState(false);
//   const [highlightedIndex, setHighlightedIndex] = useState(-1);
//   const dropdownRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const dropdownListRef = useRef(null);

//   // Filter options
//   const [tenderTypes, setTenderTypes] = useState([]);
//   const [selectedTenderType, setSelectedTenderType] = useState("");

//   // Date filter states (UI)
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   // Applied date filters (trigger API)
//   const [appliedFromDate, setAppliedFromDate] = useState("");
//   const [appliedToDate, setAppliedToDate] = useState("");

//   // Min over budget filter (UI)
//   const [minOverBudget, setMinOverBudget] = useState("");

//   // Applied min over budget filter (trigger API)
//   const [appliedMinOverBudget, setAppliedMinOverBudget] = useState("");

//   // Financial year filter - fetched from API (UI)
//   const [financialYears, setFinancialYears] = useState([]);
//   const [selectedFinYear, setSelectedFinYear] = useState("");
//   const [loadingFinYears, setLoadingFinYears] = useState(false);

//   // Applied financial year filter (trigger API)
//   const [appliedFinYear, setAppliedFinYear] = useState("");

//   // Report data states
//   const [reportName, setReportName] = useState("");
//   const [reportDate, setReportDate] = useState("");
//   const [filtersApplied, setFiltersApplied] = useState({});
//   const [summaryData, setSummaryData] = useState(null);

//   // Print states
//   const [showPrint, setShowPrint] = useState(false);
//   const [printOrientation, setPrintOrientation] = useState("landscape");

//   const { organization } = useOrganization();

//   // Get dynamic page title
//   useEffect(() => {
//     try {
//       const menuDetails = JSON.parse(localStorage.getItem("menu_details") || "[]");
//       const currentPath = "/reports/tender-management/over-budgeted";
//       const currentMenuItem = menuDetails.find(item => item.Menu_Links ==  currentPath);
//       if (currentMenuItem && currentMenuItem.Fnc_Title) {
//         setPageTitle(currentMenuItem.Fnc_Title);
//       }
//     } catch (error) {
//       console.error("Error parsing menu details:", error);
//     }
//   }, []);

//   // Fetch departments and financial years on mount
//   useEffect(() => {
//     fetchDepartments();
//     fetchFinancialYears();
//   }, []);

//   // Handle click outside dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowDeptDropdown(false);
//         setHighlightedIndex(-1);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Fetch data when APPLIED filters change
//   useEffect(() => {
//     if (selectedDept) {
//       fetchOverBudgetedReport();
//     }
//   }, [selectedDept, appliedFinYear, selectedTenderType, appliedMinOverBudget, appliedFromDate, appliedToDate, currentPage]);

//   // Filter data based on search
//   useEffect(() => {
//     filterData();
//   }, [reportData, searchQuery]);

//   // Extract unique tender types from report data
//   useEffect(() => {
//     if (reportData.length > 0) {
//       const uniqueTypes = {};
//       reportData.forEach(item => {
//         if (item.tender_type && !uniqueTypes[item.tender_type]) {
//           uniqueTypes[item.tender_type] = item.tender_type;
//         }
//       });
//       setTenderTypes(Object.values(uniqueTypes));
//     } else {
//       setTenderTypes([]);
//     }
//   }, [reportData]);

//   // Reset highlighted index when search query changes
//   useEffect(() => {
//     setHighlightedIndex(-1);
//   }, [deptSearchQuery]);

//   // Scroll highlighted item into view
//   useEffect(() => {
//     if (highlightedIndex >= 0 && dropdownListRef.current) {
//       const highlightedElement = dropdownListRef.current.children[highlightedIndex];
//       if (highlightedElement) {
//         highlightedElement.scrollIntoView({
//           block: 'nearest',
//           behavior: 'smooth'
//         });
//       }
//     }
//   }, [highlightedIndex]);

//   const fetchFinancialYears = async () => {
//     setLoadingFinYears(true);
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_API_URL}/fy-master`
//       );
//       if (response.data.success) {
//         setFinancialYears(response.data.data);

//         // Auto-select current financial year if available - store the ID
//         const currentYear = response.data.data.find(year => year.is_current_year);
//         if (currentYear) {
//           setSelectedFinYear(currentYear.FY_Id.toString()); // Store the ID as string
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching financial years:", err);
//       setMessage({ text: "Failed to load financial years", type: "error" });
//     } finally {
//       setLoadingFinYears(false);
//     }
//   };

//   const fetchDepartments = async () => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`
//       );
//       if (response.data.success) {
//         setDepartments(response.data.data);
//       }
//     } catch (err) {
//       console.error("Error fetching departments:", err);
//       setMessage({ text: "Failed to load departments", type: "error" });
//     }
//   };

//   const fetchOverBudgetedReport = async () => {
//     if (!selectedDept) return;

//     setLoading(true);
//     try {
//       const params = {
//         dept_id: selectedDept.id,
//         ...(appliedFinYear && { fin_year: parseInt(appliedFinYear) }), // Convert to integer
//         ...(selectedTenderType && { tender_type_id: selectedTenderType }),
//         ...(appliedMinOverBudget && { min_over_budget: appliedMinOverBudget }),
//         ...(appliedFromDate && { from_date: appliedFromDate }),
//         ...(appliedToDate && { to_date: appliedToDate }),
//         page: currentPage,
//         per_page: itemsPerPage,
//       };

//       console.log("Fetching with params:", params);

//       const response = await axios.get(
//         `${import.meta.env.VITE_API_URL}/tender-reports/over-budgeted`,
//         { params }
//       );

//       if (response.data.success) {
//         setReportName(response.data.report_name);
//         setReportDate(response.data.report_date);
//         setFiltersApplied(response.data.filters_applied || {});
//         setSummaryData(response.data.summary);

//         // Process the data with only the required fields
//         const processedData = response.data.data.map((item, index) => ({
//           id: item.work_order_id || index,
//           budgetHead: item.budget_head || "-",
//           budgetAmount: item.budget_amount || 0,
//           formattedBudgetAmount: item.formatted_budget_amount || formatCurrency(item.budget_amount || 0),
//           budgetUsed: item.budget_used || 0,
//           formattedBudgetUsed: item.formatted_budget_used || formatCurrency(item.budget_used || 0),
//           tenderAmount: item.tender_amount || 0,
//           formattedTenderAmount: item.formatted_tender_amount || formatCurrency(item.tender_amount || 0),
//           overBudgetValue: item.over_budget_value || 0,
//           formattedOverBudgetValue: item.formatted_over_budget_value || formatCurrency(item.over_budget_value || 0),
//         }));

//         setReportData(processedData);
//         setFilteredData(processedData);

//         if (processedData.length ==  0) {
//           setMessage({
//             text: response.data.message || "No over-budgeted work orders found",
//             type: "info",
//           });
//         } else {
//           setMessage({
//             text: `Loaded ${processedData.length} over-budgeted work orders`,
//             type: "success",
//           });
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching over-budgeted report:", err);
//       setMessage({
//         text: err.response?.data?.message || "Error loading over-budgeted work orders report",
//         type: "error",
//       });
//       setReportData([]);
//       setFilteredData([]);
//       setSummaryData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Apply all filters
//   const applyFilters = () => {
//     console.log("Applying filters:", {
//       fromDate,
//       toDate,
//       minOverBudget,
//       selectedFinYear
//     });

//     setAppliedFromDate(fromDate);
//     setAppliedToDate(toDate);
//     setAppliedMinOverBudget(minOverBudget);
//     setAppliedFinYear(selectedFinYear);
//     setCurrentPage(1);
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(amount || 0);
//   };

//   const filterData = () => {
//     if (!reportData.length) {
//       setFilteredData([]);
//       return;
//     }

//     let filtered = [...reportData];

//     // Apply search filter
//     const searchLower = searchQuery.toLowerCase().trim();
//     if (searchLower) {
//       filtered = filtered.filter((item) =>
//         item.budgetHead?.toLowerCase().includes(searchLower)
//       );
//     }

//     setFilteredData(filtered);
//     setCurrentPage(1);
//   };

//   // Keyboard navigation handlers
//   const handleDeptKeyDown = (e) => {
//     const filteredDepts = filteredDepartments;

//     switch (e.key) {
//       case "Enter":
//         e.preventDefault();
//         if (!showDeptDropdown) {
//           setShowDeptDropdown(true);
//           setTimeout(() => {
//             if (searchInputRef.current) {
//               searchInputRef.current.focus();
//             }
//           }, 100);
//         } else if (highlightedIndex >= 0 && filteredDepts[highlightedIndex]) {
//           selectDepartment(filteredDepts[highlightedIndex]);
//         }
//         break;
//       case "ArrowDown":
//         e.preventDefault();
//         if (!showDeptDropdown) {
//           setShowDeptDropdown(true);
//         } else {
//           setHighlightedIndex(prev =>
//             prev < filteredDepts.length - 1 ? prev + 1 : prev
//           );
//         }
//         break;
//       case "ArrowUp":
//         e.preventDefault();
//         if (showDeptDropdown) {
//           setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
//         }
//         break;
//       case "Escape":
//         e.preventDefault();
//         setShowDeptDropdown(false);
//         setHighlightedIndex(-1);
//         break;
//       default:
//         break;
//     }
//   };

//   const handleSearchKeyDown = (e) => {
//     const filteredDepts = filteredDepartments;

//     switch (e.key) {
//       case "Enter":
//         e.preventDefault();
//         if (highlightedIndex >= 0 && filteredDepts[highlightedIndex]) {
//           selectDepartment(filteredDepts[highlightedIndex]);
//         }
//         break;
//       case "ArrowDown":
//         e.preventDefault();
//         setHighlightedIndex(prev =>
//           prev < filteredDepts.length - 1 ? prev + 1 : prev
//         );
//         break;
//       case "ArrowUp":
//         e.preventDefault();
//         setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
//         break;
//       case "Escape":
//         e.preventDefault();
//         setShowDeptDropdown(false);
//         setHighlightedIndex(-1);
//         break;
//       default:
//         break;
//     }
//   };

//   const selectDepartment = (dept) => {
//     setSelectedDept({
//       id: dept.Dpt_id,
//       name: dept.Dpt_Name,
//       desc: dept.Dpt_Desc,
//     });
//     setShowDeptDropdown(false);
//     setDeptSearchQuery("");
//     setHighlightedIndex(-1);
//     setCurrentPage(1);
//   };

//   const handleTenderTypeChange = (e) => {
//     setSelectedTenderType(e.target.value);
//     setCurrentPage(1);
//   };

//   const handleFinYearChange = (e) => {
//     setSelectedFinYear(e.target.value); // This will now be the ID
//   };

//   const resetFilters = () => {
//     setSelectedDept(null);
//     setSelectedFinYear("");
//     setSelectedTenderType("");
//     setMinOverBudget("");
//     setFromDate("");
//     setToDate("");
//     setAppliedFinYear("");
//     setAppliedMinOverBudget("");
//     setAppliedFromDate("");
//     setAppliedToDate("");
//     setSearchQuery("");
//     setCurrentPage(1);
//   };

//   const exportToExcel = () => {
//     if (filteredData.length ==  0) {
//       setMessage({
//         text: "No data to export",
//         type: "error",
//       });
//       return;
//     }

//     try {
//       setLoading(true);
//       const wb = XLSX.utils.book_new();

//       // Find selected financial year name for display
//       const selectedFinYearName = financialYears.find(
//         fy => fy.FY_Id ==  parseInt(appliedFinYear || selectedFinYear)
//       )?.FY_Name || appliedFinYear || selectedFinYear;

//       // Summary Sheet
//       const summarySheetData = [
//         {
//           "Report Type": pageTitle,
//           "Department": selectedDept?.name || "All",
//           "Financial Year": selectedFinYearName || "All",
//           "Tender Type": selectedTenderType || "All",
//           "Min Over Budget": appliedMinOverBudget || minOverBudget || "All",
//           "Date Range": appliedFromDate && appliedToDate ? `${appliedFromDate} to ${appliedToDate}` : "All",
//           "Report Name": reportName,
//           "Report Date": reportDate,
//           "Report Generated": new Date().toLocaleString(),
//         },
//         {},
//         {
//           "Summary Metrics": "Value",
//           "Total Over Budget Items": summaryData?.total_over_budget_items || 0,
//           "Total Budget Amount": summaryData?.formatted_total_budget_amount || formatCurrency(summaryData?.total_budget_amount || 0),
//           "Total Budget Used": summaryData?.formatted_total_budget_used || formatCurrency(summaryData?.total_budget_used || 0),
//           "Total Tender Amount": summaryData?.formatted_total_tender_amount || formatCurrency(summaryData?.total_tender_amount || 0),
//           "Total Over Budget Value": summaryData?.formatted_total_over_budget_value || formatCurrency(summaryData?.total_over_budget_value || 0),
//         },
//       ];

//       const summaryWs = XLSX.utils.json_to_sheet(summarySheetData);
//       XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

//       // Details Sheet with only the required fields
//       const detailsData = [
//         [
//           "Budget Head",
//           "Budget Amount",
//           "Budget Used",
//           "Tender Amount",
//           "Over Budget Value",
//         ],
//       ];

//       filteredData.forEach((item) => {
//         detailsData.push([
//           item.budgetHead,
//           item.formattedBudgetAmount,
//           item.formattedBudgetUsed,
//           item.formattedTenderAmount,
//           item.formattedOverBudgetValue,
//         ]);
//       });

//       // Add summary row
//       if (summaryData) {
//         detailsData.push([
//           "TOTALS:",
//           summaryData.formatted_total_budget_amount || formatCurrency(summaryData?.total_budget_amount || 0),
//           summaryData.formatted_total_budget_used || formatCurrency(summaryData?.total_budget_used || 0),
//           summaryData.formatted_total_tender_amount || formatCurrency(summaryData?.total_tender_amount || 0),
//           summaryData.formatted_total_over_budget_value || formatCurrency(summaryData?.total_over_budget_value || 0),
//         ]);
//       }

//       const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);

//       // Set column widths
//       const colWidths = [
//         { wch: 25 }, // Budget Head
//         { wch: 18 }, // Budget Amount
//         { wch: 18 }, // Budget Used
//         { wch: 18 }, // Tender Amount
//         { wch: 18 }, // Over Budget Value
//       ];
//       detailsWs["!cols"] = colWidths;

//       XLSX.utils.book_append_sheet(wb, detailsWs, "Over Budget Details");

//       // Generate filename
//       const deptName = selectedDept?.name?.replace(/\s+/g, "_") || "All_Depts";
//       const dateStamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
//       const filename = `Over_Budgeted_Work_Orders_${deptName}_${dateStamp}.xlsx`;

//       XLSX.writeFile(wb, filename);

//       setMessage({
//         text: "Excel report downloaded successfully!",
//         type: "success",
//       });
//     } catch (error) {
//       console.error("Error downloading Excel:", error);
//       setMessage({
//         text: "Error creating Excel file: " + error.message,
//         type: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const PrintReportContent = () => {
//     const styles = {
//       section: { marginBottom: "15px", pageBreakInside: "avoid" },
//       sectionTitle: {
//         backgroundColor: "#f3f4f6",
//         padding: "6px 8px",
//         margin: "8px 0",
//         fontWeight: "600",
//         borderLeft: "3px solid #EF5350",
//         fontSize: "12px",
//         color: "#1f2937",
//       },
//       table: {
//         width: "100%",
//         borderCollapse: "collapse",
//         margin: "6px 0",
//         fontSize: "10px",
//       },
//       th: {
//         backgroundColor: "#f1f5f9",
//         fontWeight: "600",
//         padding: "6px 8px",
//         border: "1px solid #cbd5e0",
//         textAlign: "left",
//       },
//       td: {
//         padding: "5px 8px",
//         border: "1px solid #e5e7eb",
//         verticalAlign: "top",
//       },
//       textBold: { fontWeight: "600" },
//       textRight: { textAlign: "right" },
//     };

//     // Find selected financial year details using ID
//     const selectedFinYearDetails = financialYears.find(
//       fy => fy.FY_Id ==  parseInt(appliedFinYear || selectedFinYear)
//     );

//     return (
//       <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
//         {/* Filters Applied */}
//         <div style={styles.section}>
//           <div style={styles.sectionTitle}>Filters Applied</div>
//           <table style={styles.table}>
//             <tbody>
//               <tr>
//                 <td style={{ ...styles.td, fontWeight: "600", width: "200px" }}>Department:</td>
//                 <td style={styles.td}>{selectedDept?.name || 'All'}</td>
//               </tr>
//               <tr>
//                 <td style={{ ...styles.td, fontWeight: "600" }}>Financial Year:</td>
//                 <td style={styles.td}>
//                   {selectedFinYearDetails?.FY_Name || appliedFinYear || selectedFinYear || 'All'}
//                   {selectedFinYearDetails && (
//                     <span style={{ color: '#666', marginLeft: '8px' }}>
//                       ({selectedFinYearDetails.St_Date} to {selectedFinYearDetails.Ed_Date})
//                     </span>
//                   )}
//                 </td>
//               </tr>
//               <tr>
//                 <td style={{ ...styles.td, fontWeight: "600" }}>Tender Type:</td>
//                 <td style={styles.td}>{selectedTenderType || 'All'}</td>
//               </tr>
//               <tr>
//                 <td style={{ ...styles.td, fontWeight: "600" }}>Min Over Budget:</td>
//                 <td style={styles.td}>{appliedMinOverBudget ? `₹ ${parseFloat(appliedMinOverBudget).toLocaleString('en-IN')}` : 'All'}</td>
//               </tr>
//               <tr>
//                 <td style={{ ...styles.td, fontWeight: "600" }}>Date Range:</td>
//                 <td style={styles.td}>{appliedFromDate && appliedToDate ? `${appliedFromDate} to ${appliedToDate}` : 'All'}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Details Table with only required fields */}
//         {filteredData.length > 0 && (
//           <div style={styles.section}>
//             <div style={styles.sectionTitle}>
//               Over Budgeted Work Orders ({filteredData.length} items)
//             </div>
//             <table style={styles.table}>
//               <thead>
//                 <tr>
//                   <th style={styles.th}>Budget Head</th>
//                   <th style={styles.th}>Budget Amount</th>
//                   <th style={styles.th}>Budget Used</th>
//                   <th style={styles.th}>Tender Amount</th>
//                   <th style={styles.th}>Over Budget Value</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredData.map((item) => (
//                   <tr key={item.id}>
//                     <td style={styles.td}>{item.budgetHead}</td>
//                     <td style={{ ...styles.td, ...styles.textRight }}>{item.formattedBudgetAmount}</td>
//                     <td style={{ ...styles.td, ...styles.textRight }}>{item.formattedBudgetUsed}</td>
//                     <td style={{ ...styles.td, ...styles.textRight }}>{item.formattedTenderAmount}</td>
//                     <td style={{ ...styles.td, ...styles.textRight, color: "#dc2626", fontWeight: "600" }}>
//                       {item.formattedOverBudgetValue}
//                     </td>
//                   </tr>
//                 ))}

//                 {/* Totals Row */}
//                 {summaryData && (
//                   <tr style={{ backgroundColor: "#f9fafb", fontWeight: "600" }}>
//                     <td style={{ ...styles.td, ...styles.textBold }}>TOTALS:</td>
//                     <td style={{ ...styles.td, ...styles.textRight }}>
//                       {summaryData.formatted_total_budget_amount || formatCurrency(summaryData.total_budget_amount || 0)}
//                     </td>
//                     <td style={{ ...styles.td, ...styles.textRight }}>
//                       {summaryData.formatted_total_budget_used || formatCurrency(summaryData.total_budget_used || 0)}
//                     </td>
//                     <td style={{ ...styles.td, ...styles.textRight }}>
//                       {summaryData.formatted_total_tender_amount || formatCurrency(summaryData.total_tender_amount || 0)}
//                     </td>
//                     <td style={{ ...styles.td, ...styles.textRight, color: "#dc2626" }}>
//                       {summaryData.formatted_total_over_budget_value || formatCurrency(summaryData.total_over_budget_value || 0)}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//   const filteredDepartments = departments.filter(dept =>
//     dept.Dpt_Name?.toLowerCase().includes(deptSearchQuery.toLowerCase())
//   );

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-100">
//       {/* Print Layout Component */}
//       {showPrint && (
//         <PrintLayout
//           title={pageTitle}
//           showControls={true}
//           onClose={() => setShowPrint(false)}
//           organizationData={organization}
//           orientation={printOrientation}
//           onOrientationChange={setPrintOrientation}
//         >
//           <PrintReportContent />
//         </PrintLayout>
//       )}

//       <div className="px-2 py-6">
//         <div className="flex justify-between items-center mb-6">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
//           >
//             <FiChevronLeft className="mr-1" />
//             Back to Dashboard
//           </button>
//           <div className="w-24"></div>
//         </div>

//         {/* Header Card */}
//         <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h2 className="text-xl font-semibold text-gray-800">
//                 {pageTitle}
//               </h2>
//               {reportDate && (
//                 <p className="text-sm text-gray-500 mt-1">Report Date: {reportDate}</p>
//               )}
//             </div>
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => setShowPrint(true)}
//                 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
//                 disabled={!selectedDept || filteredData.length ==  0}
//               >
//                 <FiPrinter className="h-4 w-4 mr-2" />
//                 Print
//               </button>
//               <button
//                 onClick={exportToExcel}
//                 className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
//                 disabled={!selectedDept || filteredData.length ==  0}
//               >
//                 <FiFileText className="h-4 w-4 mr-2" />
//                 Excel
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
//             {/* Department Selector */}
//             <div className="relative" ref={dropdownRef}>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Select Department <span className="text-red-500">*</span>
//               </label>
//               <div
//                 onClick={() => setShowDeptDropdown(!showDeptDropdown)}
//                 onKeyDown={handleDeptKeyDown}
//                 tabIndex={0}
//                 role="button"
//                 aria-haspopup="listbox"
//                 aria-expanded={showDeptDropdown}
//                 className="w-full border border-gray-300 rounded-md p-3 bg-white cursor-pointer hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
//               >
//                 {selectedDept ? (
//                   <>
//                     <div className="font-medium text-gray-900 text-sm">
//                       {selectedDept.name}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {selectedDept.desc}
//                     </div>
//                   </>
//                 ) : (
//                   <span className="text-gray-500 text-sm">Choose a department...</span>
//                 )}
//               </div>

//               {/* Department Dropdown */}
//               {showDeptDropdown && (
//                 <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden">
//                   <div className="p-2 border-b">
//                     <div className="flex items-center border rounded-md px-3 py-2">
//                       <FiSearch className="h-4 w-4 text-gray-400" />
//                       <input
//                         ref={searchInputRef}
//                         type="text"
//                         className="ml-2 w-full focus:outline-none text-sm"
//                         placeholder="Search departments..."
//                         value={deptSearchQuery}
//                         onChange={(e) => setDeptSearchQuery(e.target.value)}
//                         onKeyDown={handleSearchKeyDown}
//                         autoFocus
//                       />
//                     </div>
//                   </div>
//                   <div
//                     ref={dropdownListRef}
//                     className="overflow-y-auto max-h-64"
//                     role="listbox"
//                   >
//                     {filteredDepartments.length > 0 ? (
//                       filteredDepartments.map((dept, index) => (
//                         <div
//                           key={dept.Dpt_id}
//                           onClick={() => selectDepartment(dept)}
//                           onMouseEnter={() => setHighlightedIndex(index)}
//                           className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${highlightedIndex ==  index
//                             ? 'bg-blue-100'
//                             : 'hover:bg-blue-50'
//                             }`}
//                           role="option"
//                           aria-selected={highlightedIndex ==  index}
//                         >
//                           <div className="font-medium text-gray-900 text-sm">
//                             {dept.Dpt_Name}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {dept.Dpt_Desc}
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="p-4 text-center text-gray-500">
//                         No departments found
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Financial Year Filter - Now using ID as value */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Financial Year
//               </label>
//               <select
//                 value={selectedFinYear}
//                 onChange={handleFinYearChange}
//                 className="w-full border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
//                 disabled={loading || loadingFinYears || !selectedDept}
//               >
//                 <option value="">All Financial Years</option>
//                 {financialYears.map((year) => (
//                   <option key={year.FY_Id} value={year.FY_Id}>
//                     {year.FY_Name} {year.is_current_year ? '(Current)' : ''}
//                   </option>
//                 ))}
//               </select>
//               {loadingFinYears && (
//                 <p className="text-xs text-gray-500 mt-1">Loading financial years...</p>
//               )}
//             </div>

//             {/* Tender Type Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Tender Type
//               </label>
//               <select
//                 value={selectedTenderType}
//                 onChange={handleTenderTypeChange}
//                 className="w-full border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
//                 disabled={loading || !selectedDept}
//               >
//                 <option value="">All Tender Types</option>
//                 {tenderTypes.map((type, index) => (
//                   <option key={index} value={type}>
//                     {type}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Min Over Budget Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Min Over Budget (₹)
//               </label>
//               <input
//                 type="number"
//                 value={minOverBudget}
//                 onChange={(e) => setMinOverBudget(e.target.value)}
//                 placeholder="Enter minimum amount"
//                 className="w-full border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
//                 disabled={loading || !selectedDept}
//                 min="0"
//                 step="1000"
//               />
//             </div>

//             {/* Date Range Filters */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 From Date
//               </label>
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 className="w-full border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
//                 disabled={loading || !selectedDept}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 To Date
//               </label>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 className="w-full border border-gray-300 rounded-md p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
//                 disabled={loading || !selectedDept}
//               />
//             </div>

//             {/* Apply Filters Button - Full width */}
//             <div className="xl:col-span-6 flex justify-end mt-2">
//               <button
//                 onClick={applyFilters}
//                 className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center font-medium"
//                 disabled={loading || !selectedDept}
//               >
//                 <FiSearch className="mr-2" />
//                 Apply Filters
//               </button>
//             </div>
//           </div>

//           {/* Reset Filters Button */}
//           {(selectedDept || selectedFinYear || selectedTenderType || minOverBudget || fromDate || toDate || appliedFinYear || appliedMinOverBudget || appliedFromDate || appliedToDate) && (
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={resetFilters}
//                 className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
//               >
//                 Reset Filters
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Main Table Card */}
//         <div className="bg-white p-4 rounded-lg shadow-sm">
//           <div className="flex flex-wrap justify-between items-center mb-4">
//             <div className="flex items-center space-x-2 flex-wrap gap-2">
//               <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
//                 Over Budgeted Items: {filteredData.length}
//               </div>
//               {selectedDept && (
//                 <div className="text-sm text-gray-600">
//                   {selectedDept.name}
//                 </div>
//               )}
//               {(appliedFromDate || appliedToDate) && (
//                 <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
//                   Date: {appliedFromDate || "..."} to {appliedToDate || "..."}
//                 </div>
//               )}
//               {appliedMinOverBudget && (
//                 <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
//                   Min Over Budget: ₹ {parseFloat(appliedMinOverBudget).toLocaleString('en-IN')}
//                 </div>
//               )}
//               {appliedFinYear && (
//                 <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
//                   FY: {financialYears.find(fy => fy.FY_Id ==  parseInt(appliedFinYear))?.FY_Name || appliedFinYear}
//                 </div>
//               )}
//             </div>

//             <div className="flex space-x-2">
//               <div className="border bg-white rounded-md flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
//                 <FiSearch className="h-4 w-4 text-gray-400" />
//                 <input
//                   className="border-0 focus:outline-none text-sm w-full px-2 py-1 bg-transparent"
//                   placeholder="Search by Budget Head..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   disabled={loading}
//                 />
//                 {searchQuery && (
//                   <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
//                     <FiX className="h-4 w-4" />
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Table with only required fields */}
//           <div className="overflow-x-auto">
//             <table className="min-w-full border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
//                   <th className="p-3 border border-gray-200">Budget Head</th>
//                   <th className="p-3 border border-gray-200 text-right">Budget Amount</th>
//                   <th className="p-3 border border-gray-200 text-right">Budget Used</th>
//                   <th className="p-3 border border-gray-200 text-right">Tender Amount</th>
//                   <th className="p-3 border border-gray-200 text-right">Over Budget Value</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan="5" className="text-center py-8">
//                       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//                       <p className="mt-2 text-gray-500">Loading over-budgeted work orders...</p>
//                     </td>
//                   </tr>
//                 ) : currentItems.length ==  0 ? (
//                   <tr>
//                     <td colSpan="5" className="text-center py-8 bg-gray-50">
//                       <div className="flex flex-col items-center">
//                         <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
//                         <p className="text-gray-500">
//                           {searchQuery
//                             ? "No records found matching your search."
//                             : !selectedDept
//                               ? "Please select a department"
//                               : reportData.length ==  0
//                                 ? "No over-budgeted work orders found for the selected criteria"
//                                 : "No data available"}
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   <>
//                     {currentItems.map((item) => (
//                       <tr key={item.id} className="hover:bg-blue-50 transition-colors">
//                         <td className="p-3 border border-gray-200 text-sm font-medium">
//                           {item.budgetHead}
//                         </td>
//                         <td className="p-3 border border-gray-200 text-sm text-right">
//                           {item.formattedBudgetAmount}
//                         </td>
//                         <td className="p-3 border border-gray-200 text-sm text-right">
//                           {item.formattedBudgetUsed}
//                         </td>
//                         <td className="p-3 border border-gray-200 text-sm text-right">
//                           {item.formattedTenderAmount}
//                         </td>
//                         <td className="p-3 border border-gray-200 text-sm text-right font-medium text-red-600">
//                           {item.formattedOverBudgetValue}
//                         </td>
//                       </tr>
//                     ))}

//                     {/* Summary Row */}
//                     {summaryData && (
//                       <tr className="bg-gray-50 font-semibold">
//                         <td className="p-3 border border-gray-200 text-right">
//                           TOTALS:
//                         </td>
//                         <td className="p-3 border border-gray-200 text-right">
//                           {summaryData.formatted_total_budget_amount || formatCurrency(summaryData.total_budget_amount || 0)}
//                         </td>
//                         <td className="p-3 border border-gray-200 text-right">
//                           {summaryData.formatted_total_budget_used || formatCurrency(summaryData.total_budget_used || 0)}
//                         </td>
//                         <td className="p-3 border border-gray-200 text-right">
//                           {summaryData.formatted_total_tender_amount || formatCurrency(summaryData.total_tender_amount || 0)}
//                         </td>
//                         <td className="p-3 border border-gray-200 text-right text-red-600">
//                           {summaryData.formatted_total_over_budget_value || formatCurrency(summaryData.total_over_budget_value || 0)}
//                         </td>
//                       </tr>
//                     )}
//                   </>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {filteredData.length > 0 && (
//             <div className="flex justify-between items-center mt-4">
//               <div className="text-sm text-gray-500">
//                 Showing {indexOfFirstItem + 1} to{" "}
//                 {Math.min(indexOfLastItem, filteredData.length)} of{" "}
//                 {filteredData.length} entries
//               </div>
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                   disabled={currentPage ==  1 || loading}
//                   className={`p-2 rounded-md ${currentPage ==  1
//                     ? "text-gray-400 cursor-not-allowed"
//                     : "text-blue-600 hover:bg-blue-100"
//                     } transition-colors`}
//                 >
//                   <FiChevronLeft className="h-5 w-5" />
//                 </button>
//                 <div className="flex space-x-1">
//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                     (page) => (
//                       <button
//                         key={page}
//                         onClick={() => setCurrentPage(page)}
//                         className={`px-3 py-1 rounded-md text-sm ${currentPage ==  page
//                           ? "bg-blue-600 text-white"
//                           : "text-blue-600 hover:bg-blue-100"
//                           } transition-colors`}
//                         disabled={loading}
//                       >
//                         {page}
//                       </button>
//                     )
//                   )}
//                 </div>
//                 <button
//                   onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                   disabled={currentPage ==  totalPages || loading}
//                   className={`p-2 rounded-md ${currentPage ==  totalPages
//                     ? "text-gray-400 cursor-not-allowed"
//                     : "text-blue-600 hover:bg-blue-100"
//                     } transition-colors`}
//                 >
//                   <FiChevronRight className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OverBudgetedWorkOrder;

import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiHome,
  FiX,
  FiSearch,
  FiChevronDown,
  FiCheck,
  FiLayers,
  FiCalendar,
  FiDollarSign,
  FiFileText,
} from "react-icons/fi";
import { BiLoader } from "react-icons/bi";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import axios from "axios";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

// =============  SEARCHABLE DROPDOWN COMPONENT ==============
const SearchableDropdown = ({
  label,
  value,
  error,
  required = false,
  icon: Icon,
  isOpen,
  setIsOpen,
  searchTerm,
  setSearchTerm,
  items,
  filteredItems,
  highlightedIndex,
  onSelect,
  onKeyDown,
  onSearchKeyDown,
  onItemKeyDown,
  getSelectedDisplay,
  loading,
  placeholder,
  searchPlaceholder,
  buttonRef,
  dropdownRef,
  searchRef,
  itemRefs,
  listRef,
  getId = (item) => item?.id,
  disabled = false,
  renderItem,
  showAsText = false,
  lockedValue = "",
  includeAllOption = false,
  allOptionLabel = "All Departments",
  allOptionValue = "all",
}) => {
  const handleWheel = (e) => {
    e.stopPropagation();
  };

  if (showAsText) {
    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          )}
          <div
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-700`}
          >
            {lockedValue || "Auto-filled"}
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Auto-filled from selection (non-editable)
        </p>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        )}

        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={!disabled ? onKeyDown : undefined}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-2.5 border ${
            error ? "border-red-300" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          } transition-colors`}
        >
          {value ? (
            <span className="text-gray-900">{getSelectedDisplay()}</span>
          ) : (
            <span className="text-gray-500">
              {loading ? `Loading ${label.toLowerCase()}...` : placeholder}
            </span>
          )}
        </button>

        {loading ? (
          <BiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          !disabled && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiChevronDown className="h-4 w-4" />
            </button>
          )
        )}

        {error && (
          <FiAlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ minWidth: "300px" }}
        >
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div
            ref={listRef}
            className="overflow-y-auto max-h-64"
            onWheel={handleWheel}
          >
            {includeAllOption && !searchTerm && (
              <button
                type="button"
                onClick={() => {
                  onSelect({
                    id: allOptionValue,
                    name: allOptionLabel,
                    isAllOption: true,
                  });
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                  value == allOptionValue
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }`}
                tabIndex={0}
              >
                <div className="flex items-center">
                  <FiLayers className="h-4 w-4 mr-2" />
                  <span className="font-medium">{allOptionLabel}</span>
                </div>
                {value == allOptionValue && (
                  <div className="text-xs text-blue-600 mt-1 flex items-center">
                    <FiCheck className="h-3 w-3 mr-1" />
                    Selected
                  </div>
                )}
              </button>
            )}

            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const itemId = item?.Dpt_id || item?.id || `item-${idx}`;

                return (
                  <button
                    key={itemId}
                    ref={(el) => {
                      if (el && itemRefs.current) {
                        itemRefs.current[idx] = el;
                      }
                    }}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                    }}
                    onKeyDown={(e) => onItemKeyDown(e, idx, item)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${
                      highlightedIndex == idx
                        ? "bg-blue-100"
                        : value && itemId && value == itemId.toString()
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                    }`}
                    tabIndex={0}
                  >
                    {renderItem
                      ? renderItem(item)
                      : item?.Dpt_Name || item?.name}
                    {value && itemId && value == itemId.toString() && (
                      <div className="text-xs text-blue-600 mt-1 flex items-center">
                        <FiCheck className="h-3 w-3 mr-1" />
                        Selected
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <FiSearch className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No departments found</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{filteredItems.length} departments found</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
          <FiAlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

const OverBudgetedWorkOrder = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState([]);
  const [reportInfo, setReportInfo] = useState({
    report_name: "",
    report_date: "",
    filters_applied: {},
  });
  const [summaryData, setSummaryData] = useState(null);
  const [pageTitle, setPageTitle] = useState(
    "Over Budgeted Work Orders Report",
  );

  // Department selection states
  const [departments, setDepartments] = useState([]);
  const [flattenedDepartments, setFlattenedDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [appliedDepartment, setAppliedDepartment] = useState("");
  const [appliedDepartmentData, setAppliedDepartmentData] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Financial years
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [appliedFinancialYear, setAppliedFinancialYear] = useState("");
  const [finYearLoading, setFinYearLoading] = useState(false);

  // Tender types
  const [tenderTypes, setTenderTypes] = useState([]);
  const [selectedTenderType, setSelectedTenderType] = useState("");
  const [appliedTenderType, setAppliedTenderType] = useState("");

  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  // Min over budget filter
  const [minOverBudget, setMinOverBudget] = useState("");
  const [appliedMinOverBudget, setAppliedMinOverBudget] = useState("");

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Print state
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  // Department dropdown states
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearchTerm, setDeptSearchTerm] = useState("");
  const [deptHighlightedIndex, setDeptHighlightedIndex] = useState(-1);
  const deptDropdownRef = useRef(null);
  const deptSearchRef = useRef(null);
  const deptButtonRef = useRef(null);
  const deptItemRefs = useRef([]);
  const deptListRef = useRef(null);

  const { organization } = useOrganization();

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/tender-management/over-budgeted";
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

  // =============  BUILD TREE STRUCTURE FOR DEPARTMENTS ==============
  const buildDepartmentTree = (depts) => {
    const map = {};
    const roots = [];

    depts.forEach((dept) => {
      map[dept.id || dept.Dpt_id] = {
        ...dept,
        children: [],
        Dpt_id: dept.id || dept.Dpt_id,
        Dpt_Name: dept.name || dept.Dpt_Name,
        Dpt_Desc: dept.desc || dept.Dpt_Desc,
        GrStt: dept.group_stt || dept.GrStt,
        GrCod: dept.group_code || dept.GrCod,
        UpGrp: dept.up_group || dept.UpGrp,
      };
    });

    depts.forEach((dept) => {
      const deptId = dept.id || dept.Dpt_id;
      const upGroup = dept.up_group || dept.UpGrp;
      const currentDept = map[deptId];

      if (currentDept && upGroup && map[upGroup] && upGroup != deptId) {
        map[upGroup].children.push(currentDept);
      } else if (currentDept) {
        roots.push(currentDept);
      }
    });

    return roots;
  };

  // =============  FLATTEN TREE FOR DISPLAY ==============
  const flattenTree = (nodes, level = 1, result = []) => {
    nodes.forEach((node) => {
      result.push({ ...node, treeLevel: level });
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, level + 1, result);
      }
    });
    return result;
  };

  // Load departments
  const loadDepartments = async () => {
    setDropdownLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/dpt-master/all/lst-dpt-master`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );

      if (response.data.success) {
        const activeDepartments = (response.data.data || []).filter(
          (dept) =>
            dept.is_visible == 1 ||
            dept.is_visible == "1" ||
            dept.isvisible == 1 ||
            dept.isvisible == "1",
        );

        const tree = buildDepartmentTree(activeDepartments);
        const flattened = flattenTree(tree);
        setDepartments(activeDepartments);
        setFlattenedDepartments(flattened);
        setFilteredDepartments(flattened);
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    } finally {
      setDropdownLoading(false);
    }
  };

  // Load financial years
  const loadFinancialYears = async () => {
    setFinYearLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/fy-master`,
        { 
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
        }
        }
      );
      if (response.data.success) {
        setFinancialYears(response.data.data);
        // Auto-select current financial year
        const currentYear = response.data.data.find(
          (year) => year.is_current_year,
        );
        if (currentYear) {
          setSelectedFinancialYear(currentYear.FY_Id.toString());
        }
      }
    } catch (error) {
      console.error("Failed to load financial years:", error);
    } finally {
      setFinYearLoading(false);
    }
  };

  // Load tender types from report data
  const loadTenderTypes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tender-reports/over-budgeted`,
        { params: { per_page: 1 },
        headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        } 
      },
      );
      if (response.data.success && response.data.data) {
        const uniqueTypes = new Set();
        response.data.data.forEach((item) => {
          if (item.tender_type) {
            uniqueTypes.add(item.tender_type);
          }
        });
        setTenderTypes(Array.from(uniqueTypes));
      }
    } catch (error) {
      console.error("Failed to load tender types:", error);
    }
  };

  // Load departments and financial years on mount
  useEffect(() => {
    loadDepartments();
    loadFinancialYears();
    loadTenderTypes();
  }, []);

  // Fetch over-budgeted report data
  const fetchOverBudgetedReport = async (
    deptId,
    finYear,
    tenderType,
    fDate,
    tDate,
    minBudget,
  ) => {
    if (!deptId) return;

    setLoading(true);
    try {
      const params = {};

      if (deptId && deptId != "all") {
        params.dept_id = deptId;
      }
      if (finYear) params.fin_year = parseInt(finYear);
      if (tenderType) params.tender_type_id = tenderType;
      if (fDate) params.from_date = fDate;
      if (tDate) params.to_date = tDate;
      if (minBudget) params.min_over_budget = minBudget;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tender-reports/over-budgeted`,
        { params,
          headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}`         
        }
         },
      );

      if (response.data.success) {
        setReportInfo({
          report_name: response.data.report_name || pageTitle,
          report_date: response.data.report_date || new Date().toLocaleString(),
          filters_applied: response.data.filters_applied || {},
        });
        setSummaryData(response.data.summary || null);

        // Process data with required fields
        const processedData = (response.data.data || []).map((item, index) => ({
          id: item.work_order_id || item.budget_head_id || index,
          budgetHead: item.budget_head || "-",
          budgetAmount: item.budget_amount || 0,
          formattedBudgetAmount: formatAmount(item.budget_amount || 0),
          budgetUsed: item.budget_used || 0,
          formattedBudgetUsed: formatAmount(item.budget_used || 0),
          tenderAmount: item.tender_amount || 0,
          formattedTenderAmount: formatAmount(item.tender_amount || 0),
          overBudgetValue: item.over_budget_value || 0,
          formattedOverBudgetValue: formatAmount(item.over_budget_value || 0),
        }));

        setReportData(processedData);

        if (processedData.length == 0) {
          setMessage({
            text: response.data.message || "No over-budgeted work orders found",
            type: "info",
          });
        } else {
          setMessage({
            text: `Loaded ${processedData.length} over-budgeted work orders`,
            type: "success",
          });
        }
      } else {
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
        setReportData([]);
        setSummaryData(null);
      }
    } catch (err) {
      console.error("Error fetching over-budgeted report:", err);
      setMessage({
        text:
          err.response?.data?.message ||
          "Error loading over-budgeted work orders report",
        type: "error",
      });
      setReportData([]);
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  // =============  CLICK OUTSIDE HANDLER ==============
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(event.target)
      ) {
        setIsDeptDropdownOpen(false);
        setDeptHighlightedIndex(-1);
        setDeptSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =============  FOCUS SEARCH WHEN DROPDOWN OPENS ==============
  useEffect(() => {
    if (isDeptDropdownOpen && deptSearchRef.current) {
      setTimeout(() => deptSearchRef.current.focus(), 0);
    }
  }, [isDeptDropdownOpen]);

  // =============  SCROLL HIGHLIGHTED ITEM INTO VIEW ==============
  useEffect(() => {
    if (
      isDeptDropdownOpen &&
      deptHighlightedIndex >= 0 &&
      deptListRef.current
    ) {
      const container = deptListRef.current;
      const item = deptItemRefs.current[deptHighlightedIndex];
      if (item) {
        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        if (itemRect.bottom > containerRect.bottom) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else if (itemRect.top < containerRect.top) {
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  }, [deptHighlightedIndex, isDeptDropdownOpen]);

  // =============  FILTER DEPARTMENTS ==============
  useEffect(() => {
    if (!flattenedDepartments.length) return;

    if (!deptSearchTerm.trim()) {
      setFilteredDepartments(flattenedDepartments);
    } else {
      const term = deptSearchTerm.toLowerCase();
      const filtered = flattenedDepartments.filter(
        (dept) =>
          (dept.Dpt_Desc?.toLowerCase() || "").includes(term) ||
          (dept.Dpt_Name?.toLowerCase() || "").includes(term) ||
          (dept.GrCod?.toLowerCase() || "").includes(term),
      );
      setFilteredDepartments(filtered);
    }
    setDeptHighlightedIndex(-1);
  }, [deptSearchTerm, flattenedDepartments]);

  // Filter report data based on search query
  useEffect(() => {
    if (!searchQuery.trim()) return;
    // Search is applied client-side on the already loaded data
  }, [searchQuery, reportData]);

  // Format amount
  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || amount == "") return "₹ 0.00";
    const num =
      typeof amount == "string"
        ? parseFloat(amount.replace(/[^0-9.-]/g, ""))
        : parseFloat(amount);
    if (isNaN(num)) return "₹ 0.00";
    return `₹ ${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
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

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedDepartment("");
    setAppliedDepartmentData(null);
    setAppliedFinancialYear("");
    setAppliedTenderType("");
    setAppliedFromDate("");
    setAppliedToDate("");
    setAppliedMinOverBudget("");
    setReportData([]);
    setSummaryData(null);
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setSelectedDepartment("");
    setSelectedFinancialYear("");
    setSelectedTenderType("");
    setFromDate("");
    setToDate("");
    setMinOverBudget("");
    invalidateReport();
  };

  const handleGenerateReport = async () => {
    if (!selectedDepartment) {
      setMessage({ text: "Please select a department.", type: "info" });
      return;
    }

    setAppliedDepartment(selectedDepartment);
    setAppliedFinancialYear(selectedFinancialYear);
    setAppliedTenderType(selectedTenderType);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setAppliedMinOverBudget(minOverBudget);
    setHasGenerated(true);
    setMessage({ text: "", type: "" });

    if (selectedDepartment && selectedDepartment != "all") {
      const selected = flattenedDepartments.find(
        (d) => (d.Dpt_id || d.id)?.toString() == selectedDepartment,
      );
      setAppliedDepartmentData(selected || null);
    } else {
      setAppliedDepartmentData(null);
    }

    await fetchOverBudgetedReport(
      selectedDepartment,
      selectedFinancialYear,
      selectedTenderType,
      fromDate,
      toDate,
      minOverBudget,
    );
  };

  // =============  DEPARTMENT DISPLAY FUNCTIONS ==============
  const renderDepartmentItem = (dept) => {
    const level = parseInt(dept.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = dept.Dpt_Desc || dept.desc || "No Description";
    const name = dept.Dpt_Name || dept.name;
    const colorClass = "bg-gray-100 text-gray-600";

    return (
      <div className="py-1">
        <div className="flex items-start">
          <div
            className={`h-6 w-6 rounded flex items-center justify-center mr-3 flex-shrink-0 ${colorClass}`}
          >
            <span className="text-xs font-bold">L{level}</span>
          </div>
          <div className="flex-1">
            <div
              className="text-sm font-medium text-gray-900 whitespace-pre-wrap"
              style={{ marginLeft: `${(level - 1) * 20}px` }}
            >
              {desc}
            </div>
            {name && name != desc && (
              <div
                className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap"
                style={{ marginLeft: `${(level - 1) * 20}px` }}
              >
                {name}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getSelectedDepartmentDisplay = () => {
    if (!selectedDepartment) return "";
    if (selectedDepartment == "all") return "All Departments";
    const selected = flattenedDepartments.find(
      (dept) => (dept.Dpt_id || dept.id)?.toString() == selectedDepartment,
    );
    if (!selected) return "Selected department not found";

    const level = parseInt(selected.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc = selected.Dpt_Desc || selected.desc || "No Description";
    const name = selected.Dpt_Name || selected.name;

    if (name && name != desc) {
      return `${indent}${desc} (${name})`;
    }
    return `${indent}${desc}`;
  };

  const getAppliedDepartmentDisplay = () => {
    if (appliedDepartment == "all") return "All Departments";
    if (!appliedDepartmentData) return "";

    const level = parseInt(appliedDepartmentData.GrStt, 10) || 1;
    const indent = "    ".repeat(level - 1);
    const desc =
      appliedDepartmentData.Dpt_Desc ||
      appliedDepartmentData.desc ||
      "No Description";
    const name = appliedDepartmentData.Dpt_Name || appliedDepartmentData.name;

    if (name && name != desc) {
      return `${indent}${desc} (${name})`;
    }
    return `${indent}${desc}`;
  };

  // Department select handler
  const handleDepartmentSelect = (dept) => {
    if (dept && dept.isAllOption) {
      setSelectedDepartment("all");
    } else if (dept && (dept.Dpt_id || dept.id)) {
      const deptId = (dept.Dpt_id || dept.id).toString();
      setSelectedDepartment(deptId);
    }
    setIsDeptDropdownOpen(false);
    setDeptSearchTerm("");
    setDeptHighlightedIndex(-1);

    // If the report is already visible, require regeneration after filter change
    if (hasGenerated) invalidateReport();
  };

  // Department dropdown key handlers
  const handleDepartmentKeyDown = (e) => {
    if (e.key == "ArrowDown" || e.key == "ArrowUp" || e.key == "Enter") {
      e.preventDefault();
      if (!isDeptDropdownOpen) {
        setIsDeptDropdownOpen(true);
        setDeptSearchTerm("");
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "Escape") {
      e.preventDefault();
      if (isDeptDropdownOpen) {
        setIsDeptDropdownOpen(false);
        setDeptHighlightedIndex(-1);
        setDeptSearchTerm("");
      }
    }
  };

  const handleDeptSearchKeyDown = (e) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      if (filteredDepartments.length > 0) {
        setDeptHighlightedIndex(0);
        setTimeout(() => {
          if (deptItemRefs.current[0]) {
            deptItemRefs.current[0].focus();
          }
        }, 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      deptButtonRef.current?.focus();
    }
  };

  const handleDeptItemKeyDown = (e, idx, item) => {
    if (e.key == "ArrowDown") {
      e.preventDefault();
      const nextIndex = idx + 1;
      if (nextIndex < filteredDepartments.length) {
        setDeptHighlightedIndex(nextIndex);
        setTimeout(() => {
          if (deptItemRefs.current[nextIndex]) {
            deptItemRefs.current[nextIndex].focus();
          }
        }, 0);
      } else {
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      }
    } else if (e.key == "ArrowUp") {
      e.preventDefault();
      if (idx == 0) {
        setDeptHighlightedIndex(-1);
        setTimeout(() => deptSearchRef.current?.focus(), 0);
      } else {
        const prevIndex = idx - 1;
        setDeptHighlightedIndex(prevIndex);
        setTimeout(() => {
          if (deptItemRefs.current[prevIndex]) {
            deptItemRefs.current[prevIndex].focus();
          }
        }, 0);
      }
    } else if (e.key == "Enter") {
      e.preventDefault();
      handleDepartmentSelect(item);
    } else if (e.key == "Escape") {
      e.preventDefault();
      setIsDeptDropdownOpen(false);
      setDeptHighlightedIndex(-1);
      setDeptSearchTerm("");
      deptButtonRef.current?.focus();
    }
  };

  const handleExcelExport = () => {
    const rows = filteredData.map((item) => ({
      "Budget Head": item.budgetHead,
      "Budget Amount": item.budgetAmount || 0,
      "Budget Used": item.budgetUsed || 0,
      "Tender Amount": item.tenderAmount || 0,
      "Over Budget Value": item.overBudgetValue || 0,
    }));
    if (summaryData) {
      rows.push({
        "Budget Head": "TOTALS",
        "Budget Amount": summaryData.total_budget_amount || 0,
        "Budget Used": summaryData.total_budget_used || 0,
        "Tender Amount": summaryData.total_tender_amount || 0,
        "Over Budget Value": summaryData.total_over_budget_value || 0,
      });
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Over Budgeted");
    XLSX.writeFile(wb, `OverBudgeted.xlsx`);
  };

  // Filtered data based on search
  const getFilteredData = () => {
    if (!searchQuery.trim()) return reportData;
    const term = searchQuery.toLowerCase();
    return reportData.filter((item) =>
      item.budgetHead?.toLowerCase().includes(term),
    );
  };

  const filteredData = getFilteredData();
  const hasData = reportData.length > 0;

  // Print Report Content
  const PrintReportContent = () => {
    const styles = {
      page: {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
      },
      header: {
        textAlign: "center",
        marginBottom: "8px",
        borderBottom: "2px solid #333",
        paddingBottom: "8px",
      },
      title: {
        fontSize: "18px",
        fontWeight: "bold",
        margin: "5px 0",
      },
      deptInfo: {
        margin: "0 0 8px 0",
        padding: "8px 10px",
        backgroundColor: "#e6f3ff",
        borderLeft: "4px solid #E53935",
      },
      section: {
        margin: "0",
        padding: "0",
      },
      sectionTitle: {
        backgroundColor: "#FFCDD2",
        padding: "8px 12px",
        margin: "0",
        fontWeight: "600",
        borderLeft: "none",
        fontSize: "14px",
        color: "#B71C1C",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "0",
        fontSize: "11px",
        tableLayout: "fixed",
      },
      th: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "8px 10px",
        border: "1px solid #cbd5e0",
        textAlign: "left",
      },
      thRight: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "8px 10px",
        border: "1px solid #cbd5e0",
        textAlign: "right",
      },
      td: {
        padding: "6px 8px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textRight: {
        textAlign: "right",
      },
      textBold: { fontWeight: "600" },
      totalRow: {
        backgroundColor: "#fef3c7",
        fontWeight: "600",
      },
    };

    const selectedFinYearDetails = financialYears.find(
      (fy) => fy.FY_Id == parseInt(appliedFinancialYear),
    );

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          <div>Generated: {reportInfo.report_date}</div>
        </div>

        {/* Department Info */}
        {appliedDepartment && (
          <div style={styles.deptInfo}>
            <strong>Department:</strong> {getAppliedDepartmentDisplay()}
          </div>
        )}

        {/* Filters Info */}
        {(appliedFinancialYear ||
          appliedTenderType ||
          appliedFromDate ||
          appliedToDate ||
          appliedMinOverBudget) && (
          <div
            style={{
              ...styles.deptInfo,
              backgroundColor: "#f3f4f6",
              borderLeftColor: "#6b7280",
              marginBottom: "8px",
            }}
          >
            <strong>Filters Applied:</strong>
            {appliedFinancialYear && selectedFinYearDetails && (
              <span> FY: {selectedFinYearDetails.FY_Name}</span>
            )}
            {appliedTenderType && (
              <span> Tender Type: {appliedTenderType}</span>
            )}
            {appliedFromDate && (
              <span> From: {formatDate(appliedFromDate)}</span>
            )}
            {appliedToDate && <span> To: {formatDate(appliedToDate)}</span>}
            {appliedMinOverBudget && (
              <span>
                {" "}
                Min Over Budget: {formatAmount(appliedMinOverBudget)}
              </span>
            )}
          </div>
        )}

        {/* Data Table */}
        {filteredData.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>
              Over Budgeted Work Orders ({filteredData.length} items)
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Budget Head</th>
                  <th style={styles.thRight}>Budget Amount</th>
                  <th style={styles.thRight}>Budget Used</th>
                  <th style={styles.thRight}>Tender Amount</th>
                  <th style={styles.thRight}>Over Budget Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.budgetHead}</td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {item.formattedBudgetAmount}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {item.formattedBudgetUsed}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {item.formattedTenderAmount}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        color: "#dc2626",
                        fontWeight: "600",
                      }}
                    >
                      {item.formattedOverBudgetValue}
                    </td>
                  </tr>
                ))}
              </tbody>
              {summaryData && (
                <tfoot>
                  <tr style={styles.totalRow}>
                    <td style={{ ...styles.td, ...styles.textBold }}>
                      TOTALS:
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {formatAmount(summaryData.total_budget_amount)}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {formatAmount(summaryData.total_budget_used)}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {formatAmount(summaryData.total_tender_amount)}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        color: "#dc2626",
                      }}
                    >
                      {formatAmount(summaryData.total_over_budget_value)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    );
  };

  // Render filters section with department dropdown
  const renderFilters = () => {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <SearchableDropdown
              label="Department"
              value={selectedDepartment}
              error={null}
              required={false}
              icon={FiHome}
              isOpen={isDeptDropdownOpen}
              setIsOpen={setIsDeptDropdownOpen}
              searchTerm={deptSearchTerm}
              setSearchTerm={setDeptSearchTerm}
              items={flattenedDepartments}
              filteredItems={filteredDepartments}
              highlightedIndex={deptHighlightedIndex}
              onSelect={handleDepartmentSelect}
              onKeyDown={handleDepartmentKeyDown}
              onSearchKeyDown={handleDeptSearchKeyDown}
              onItemKeyDown={handleDeptItemKeyDown}
              getSelectedDisplay={getSelectedDepartmentDisplay}
              loading={dropdownLoading}
              placeholder="Select Department"
              searchPlaceholder="Search by department name, description..."
              buttonRef={deptButtonRef}
              dropdownRef={deptDropdownRef}
              searchRef={deptSearchRef}
              itemRefs={deptItemRefs}
              listRef={deptListRef}
              getId={(item) => (item.Dpt_id || item.id)?.toString()}
              renderItem={renderDepartmentItem}
              includeAllOption={true}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Financial Year
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedFinancialYear}
                onChange={(e) => setSelectedFinancialYear(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={finYearLoading}
              >
                <option value="">All Financial Years</option>
                {financialYears.map((year) => (
                  <option key={year.FY_Id} value={year.FY_Id}>
                    {year.FY_Name} {year.is_current_year ? "(Current)" : ""}
                  </option>
                ))}
              </select>
              {finYearLoading && (
                <BiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tender Type
            </label>
            <div className="relative">
              <FiFileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedTenderType}
                onChange={(e) => setSelectedTenderType(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">All Tender Types</option>
                {tenderTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              To Date
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Over Budget (₹)
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={minOverBudget}
                onChange={(e) => setMinOverBudget(e.target.value)}
                placeholder="Enter minimum amount"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="1000"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading || dropdownLoading || !selectedDepartment}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
              title="Generate Report"
            >
              <FiCheck className="h-4 w-4 mr-2" />
              Generate Report
            </button>

            {(hasGenerated ||
              appliedDepartment ||
              appliedFinancialYear ||
              appliedTenderType ||
              appliedFromDate ||
              appliedToDate ||
              appliedMinOverBudget) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
              >
                <FiX className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render search bar
  const renderSearchBar = () => {
    return (
      <div className="flex justify-end mb-4">
        <div className="relative w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Budget Head..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500">Loading over-budgeted work orders...</p>
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
          Select <strong>Department</strong> and optional filters, then click{" "}
          <span className="font-medium">Generate Report</span>.
        </p>
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Over Budgeted Work Orders Found
        </h3>
        <p className="text-gray-600 mb-4">
          {appliedDepartment && appliedDepartment != "all"
            ? "No over-budgeted work orders found for the selected department with the applied filters."
            : "No over-budgeted work orders found for the selected criteria."}
        </p>
        {appliedDepartment &&
          appliedDepartment != "all" &&
          appliedDepartmentData && (
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg inline-block mx-auto">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Selected Department:</span>{" "}
                {getAppliedDepartmentDisplay()}
              </p>
            </div>
          )}
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
        >
          <FiX className="h-4 w-4 mr-2" />
          Clear Filters
        </button>
      </div>
    );

  // Render data table
  const renderDataTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget Head
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget Amount
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget Used
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tender Amount
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Over Budget Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {item.budgetHead}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">
                  {item.formattedBudgetAmount}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">
                  {item.formattedBudgetUsed}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">
                  {item.formattedTenderAmount}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-red-600">
                  {item.formattedOverBudgetValue}
                </td>
              </tr>
            ))}
          </tbody>
          {summaryData && summaryData.total_over_budget_items > 0 && (
            <tfoot className="bg-gray-50">
              <tr className="font-semibold">
                <td className="px-4 py-3 text-sm text-right text-gray-700">
                  TOTALS:
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">
                  {formatAmount(summaryData.total_budget_amount)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">
                  {formatAmount(summaryData.total_budget_used)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">
                  {formatAmount(summaryData.total_tender_amount)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-red-600">
                  {formatAmount(summaryData.total_over_budget_value)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
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
              <RiFileExcel2Line className="h-4 w-4 mr-2" />
              Excel
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
          {/* Header with title */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {pageTitle}
            </h2>
          </div>

          {/* Filters */}
          {renderFilters()}

          {/* Search Bar */}
          {hasData && renderSearchBar()}

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

export default OverBudgetedWorkOrder;
