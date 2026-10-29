import React, { useState, useEffect } from "react";
import {
  FiPrinter,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronRight as FiChevronRightIcon,
} from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const Department = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [allDepartmentData, setAllDepartmentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTitle, setPageTitle] = useState("Department List");
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Print states
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();
  const itemsPerPage = 15;

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/listing/department";
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

  // Fetch all data when component mounts
  useEffect(() => {
    fetchAllDepartmentData();
  }, []);

  // Filter data based on search query
  useEffect(() => {
    if (allDepartmentData.length > 0) {
      filterData();
    }
  }, [searchQuery, allDepartmentData]);

  const fetchAllDepartmentData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/department-list`,
        {
          params: {
            page: 1,
            per_page: 1000,
          },
           headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
          }
        },
      );

      if (response.data.success) {
        setAllDepartmentData(response.data.data);
        setFilteredData(response.data.data);
        // Expand all main departments by default
        const mainDepts = response.data.data.filter(
          (dept) => dept.department_status == "Main Department",
        );
        setExpandedNodes(
          new Set(mainDepts.map((dept) => dept.department_code)),
        );
      }
    } catch (err) {
      console.error("Error fetching department data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading department data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Build tree structure
  const buildTree = (data) => {
    const tree = [];
    const map = new Map();

    // First pass: create nodes
    data.forEach((dept) => {
      map.set(dept.department_code, {
        ...dept,
        children: [],
      });
    });

    // Second pass: build hierarchy
    data.forEach((dept) => {
      const node = map.get(dept.department_code);
      if (dept.parent_group_code == dept.department_code) {
        // This is a main department
        tree.push(node);
      } else {
        // This is a sub department
        const parent = map.get(dept.parent_group_code);
        if (parent) {
          parent.children.push(node);
        } else {
          // If parent not found, add to root
          tree.push(node);
        }
      }
    });

    // Sort children by group_serial
    const sortChildren = (nodes) => {
      nodes.sort((a, b) => (a.group_serial || 0) - (b.group_serial || 0));
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortChildren(node.children);
        }
      });
    };
    sortChildren(tree);

    return tree;
  };

  // Filter tree based on search query
  const filterTree = (nodes, query) => {
    if (!query.trim()) return nodes;

    const result = [];
    nodes.forEach((node) => {
      const deptName = getDepartmentDisplayName(node);
      const matches = deptName.toLowerCase().includes(query.toLowerCase());

      const filteredChildren = node.children
        ? filterTree(node.children, query)
        : [];

      if (matches || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren,
        });
      }
    });
    return result;
  };

  const getDepartmentDisplayName = (dept) => {
    return dept.department_name_english
      ? `${dept.department_name_gujarati} (${dept.department_name_english})`
      : dept.department_name_gujarati;
  };

  // Flatten tree for pagination
  const flattenTree = (nodes, level = 0, result = []) => {
    nodes.forEach((node) => {
      result.push({ ...node, level });
      if (
        node.children &&
        node.children.length > 0 &&
        expandedNodes.has(node.department_code)
      ) {
        flattenTree(node.children, level + 1, result);
      }
    });
    return result;
  };

  // Filter function
  const filterData = () => {
    if (!searchQuery.trim()) {
      const tree = buildTree(allDepartmentData);
      setFilteredData(tree);
      setCurrentPage(1);
      return;
    }

    const tree = buildTree(allDepartmentData);
    const filteredTree = filterTree(tree, searchQuery);
    setFilteredData(filteredTree);
    setCurrentPage(1);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    const tree = buildTree(allDepartmentData);
    setFilteredData(tree);
    setCurrentPage(1);
  };

  const toggleExpand = (deptCode) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deptCode)) {
        newSet.delete(deptCode);
      } else {
        newSet.add(deptCode);
      }
      return newSet;
    });
  };

  const exportToExcel = async () => {
    setLoading(true);
    try {
      // For Excel, flatten all data with proper indentation
      const allData = buildTree(allDepartmentData);
      const flattenedData = flattenTree(allData);

      if (flattenedData.length == 0) {
        setMessage({
          text: "No data to export",
          type: "error",
        });
        return;
      }

      const wb = XLSX.utils.book_new();

      // Prepare data for Excel with tree structure - added Sr No
      const excelData = [
        ["Sr No", "Department Name", "Department Code"],
        ...flattenedData.map((dept, index) => {
          const indent = "  ".repeat(dept.level);
          const deptName = indent + getDepartmentDisplayName(dept);
          return [index + 1, deptName, dept.department_code];
        }),
      ];

      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 8 }, // Sr No
        { wch: 60 }, // Department Name
        { wch: 15 }, // Department Code
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Departments");

      // Generate filename with current date
      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const searchSuffix = searchQuery ? `_filtered` : "";
      const filename = `Department_List${searchSuffix}_${dateStamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      setMessage({
        text: `Excel report downloaded successfully! (${flattenedData.length} records)`,
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
      container: {
        fontFamily: "'Segoe UI', 'Arial', sans-serif",
        padding: "20px",
        maxWidth: "100%",
      },
      section: {
        marginBottom: "20px",
      },
      sectionTitle: {
        fontSize: "14px",
        fontWeight: "bold",
        marginBottom: "12px",
        padding: "8px",
        backgroundColor: "#f5f5f5",
        borderLeft: "4px solid #EF5350",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "10px",
        fontSize: "10px",
      },
      th: {
        backgroundColor: "#f0f0f0",
        fontWeight: "bold",
        padding: "8px 6px",
        border: "1px solid #ddd",
        textAlign: "left",
      },
      td: {
        padding: "6px",
        border: "1px solid #ddd",
        verticalAlign: "top",
      },
    };

    // For print, flatten all data with proper indentation
    const printData = buildTree(allDepartmentData);
    const flattenedPrintData = flattenTree(printData);

    return (
      <div style={styles.container}>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            Department List - {flattenedPrintData.length}{" "}
            {flattenedPrintData.length == 1 ? "Department" : "Departments"}
            {searchQuery && ` (Filtered by: "${searchQuery}")`}
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sr No</th>
                <th style={styles.th}>Department Name</th>
                <th style={styles.th}>Department Code</th>
              </tr>
            </thead>
            <tbody>
              {flattenedPrintData.map((dept, index) => {
                const indent = dept.level * 20;
                return (
                  <tr key={index}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={{ ...styles.td, paddingLeft: indent + 6 }}>
                      {dept.level > 0 && " "}
                      {getDepartmentDisplayName(dept)}
                    </td>
                    <td style={styles.td}>{dept.department_code}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Get tree data for current view
  const treeData = filteredData;
  const flattenedViewData = flattenTree(treeData);

  // Pagination calculations
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(
    currentPage * itemsPerPage,
    flattenedViewData.length,
  );
  const currentItems = flattenedViewData.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(flattenedViewData.length / itemsPerPage);

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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">{pageTitle}</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPrint(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
                disabled={flattenedViewData.length == 0}
              >
                <FiPrinter className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
                disabled={flattenedViewData.length == 0}
              >
                <FiFileText className="h-4 w-4 mr-2" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {searchQuery
                  ? `Found ${flattenedViewData.length} departments matching "${searchQuery}"`
                  : `Total Departments: ${flattenedViewData.length}`}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex space-x-2">
              <div className="border bg-white rounded-md flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <FiSearch className="h-4 w-4 text-gray-400" />
                <input
                  className="border-0 focus:outline-none text-sm w-64 px-2 py-1 bg-transparent"
                  placeholder="Search by department name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table - Added Sr No column */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <th className="p-3 border border-gray-200 w-10">Sr No</th>
                  <th className="p-3 border border-gray-200"></th>
                  <th className="p-3 border border-gray-200">
                    Department Name
                  </th>
                  <th className="p-3 border border-gray-200">
                    Department Code
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">
                        Loading department data...
                      </p>
                    </td>
                  </tr>
                ) : flattenedViewData.length == 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 bg-gray-50">
                      <div className="flex flex-col items-center">
                        <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchQuery
                            ? `No departments found matching "${searchQuery}"`
                            : "No department data available"}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={clearSearch}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((dept, idx) => {
                    const actualIndex = indexOfFirstItem + idx;
                    const actualNode = flattenedViewData[actualIndex];
                    const hasChildren =
                      actualNode.children && actualNode.children.length > 0;
                    const isExpanded = expandedNodes.has(
                      actualNode.department_code,
                    );

                    return (
                      <tr
                        key={`${actualNode.department_code}_${actualIndex}`}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="p-3 border border-gray-200 text-sm text-center font-medium">
                          {actualIndex + 1}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm text-center">
                          {hasChildren && (
                            <button
                              onClick={() =>
                                toggleExpand(actualNode.department_code)
                              }
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {isExpanded ? (
                                <FiChevronDown className="h-4 w-4" />
                              ) : (
                                <FiChevronRightIcon className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </td>
                        <td
                          className="p-3 border border-gray-200 text-sm"
                          style={{ paddingLeft: actualNode.level * 20 + 12 }}
                        >
                          {actualNode.level > 0 && " "}
                          {getDepartmentDisplayName(actualNode)}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {actualNode.department_code}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {flattenedViewData.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to {indexOfLastItem} of{" "}
                {flattenedViewData.length} entries
                {searchQuery &&
                  ` (filtered from ${flattenedViewData.length} total)`}
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
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 10) {
                      pageNum = i + 1;
                    } else if (currentPage <= 6) {
                      pageNum = i + 1;
                      if (i == 9) pageNum = totalPages;
                    } else if (currentPage >= totalPages - 5) {
                      pageNum = totalPages - 9 + i;
                    } else {
                      pageNum = currentPage - 5 + i;
                      if (i == 0) pageNum = 1;
                      if (i == 9) pageNum = totalPages;
                    }

                    if (pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          currentPage == pageNum
                            ? "bg-blue-600 text-white"
                            : "text-blue-600 hover:bg-blue-100"
                        } transition-colors`}
                        disabled={loading}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
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

export default Department;
