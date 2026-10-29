import React, { useState, useEffect } from "react";
import {
  FiPrinter,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiSearch,
  FiX,
} from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";

const Ward = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [wardData, setWardData] = useState([]);
  const [allWardData, setAllWardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // New state for filtered data
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTitle, setPageTitle] = useState("Ward List");
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
  });

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
      const currentPath = "/reports/listing/ward";
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

  // Fetch ward data on component mount and page change
  useEffect(() => {
    fetchWardData();
  }, [currentPage]);

  // Fetch all data for search and print when component mounts
  useEffect(() => {
    fetchAllWardData();
  }, []);

  // Filter data based on search query
  useEffect(() => {
    if (allWardData.length > 0) {
      filterData();
    }
  }, [searchQuery, allWardData]);

  const fetchWardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/ward-list`,
        {
          params: {
            page: currentPage,
            per_page: itemsPerPage,
          },
           headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
          }
        },
      );

      if (response.data.success) {
        setWardData(response.data.data);
        setPagination(response.data.pagination);
        setMessage({
          text: response.data.message || "Ward list loaded successfully",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Error fetching ward data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading ward data",
        type: "error",
      });
      setWardData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWardData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/ward-list`,
        {
          params: {
            page: 1,
            per_page: 100, // Large number to get all records
          },
           headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
          }
        },
      );

      if (response.data.success) {
        setAllWardData(response.data.data);
        setFilteredData(response.data.data); // Initialize filtered data with all data
      }
    } catch (err) {
      console.error("Error fetching all ward data:", err);
    }
  };

  // Filter function
  const filterData = () => {
    if (!searchQuery.trim()) {
      setFilteredData(allWardData);
      setCurrentPage(1);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allWardData.filter(
      (ward) =>
        ward.ward_code?.toLowerCase().includes(query) ||
        ward.ward_name?.toLowerCase().includes(query) ||
        ward.zone_code?.toLowerCase().includes(query) ||
        ward.zone_name?.toLowerCase().includes(query),
    );

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredData(allWardData);
    setCurrentPage(1);
  };

  const exportToExcel = async () => {
    setLoading(true);
    try {
      // Use filtered data for export if search is active, otherwise use all data
      const dataToExport = searchQuery ? filteredData : allWardData;

      if (dataToExport.length == 0) {
        setMessage({
          text: "No data to export",
          type: "error",
        });
        return;
      }

      const wb = XLSX.utils.book_new();

      // Prepare data for Excel with Sr No, Ward Code, Ward Name, Zone Code, Zone Name
      const excelData = [
        ["Sr No", "Ward Code", "Ward Name", "Zone Code", "Zone Name"],
        ...dataToExport.map((ward, index) => [
          index + 1,
          ward.ward_code,
          ward.ward_name,
          ward.zone_code,
          ward.zone_name,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 8 }, // Sr No
        { wch: 15 }, // Ward Code
        { wch: 20 }, // Ward Name
        { wch: 15 }, // Zone Code
        { wch: 20 }, // Zone Name
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Wards");

      // Generate filename with current date and search info
      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const searchSuffix = searchQuery ? `_filtered` : "";
      const filename = `Ward_List${searchSuffix}_${dateStamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      setMessage({
        text: `Excel report downloaded successfully! (${dataToExport.length} records)`,
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
      header: {
        marginBottom: "20px",
        padding: "10px",
        borderBottom: "2px solid #EF5350",
      },
      title: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: "5px",
      },
      orgInfo: {
        fontSize: "12px",
        color: "#4b5563",
        marginBottom: "3px",
      },
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
      footer: {
        marginTop: "20px",
        padding: "10px",
        fontSize: "10px",
        color: "#6b7280",
        borderTop: "1px solid #e5e7eb",
        textAlign: "center",
      },
      searchInfo: {
        fontSize: "11px",
        color: "#4b5563",
        marginBottom: "10px",
        fontStyle: "italic",
      },
    };

    // Use filtered data for print
    const dataToPrint = filteredData;

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            Ward List - {dataToPrint.length}{" "}
            {dataToPrint.length == 1 ? "Ward" : "Wards"}
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sr No</th>
                <th style={styles.th}>Ward Code</th>
                <th style={styles.th}>Ward Name</th>
                <th style={styles.th}>Zone Code</th>
                <th style={styles.th}>Zone Name</th>
              </tr>
            </thead>
            <tbody>
              {dataToPrint.map((ward, index) => (
                <tr key={index}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{ward.ward_code}</td>
                  <td style={styles.td}>{ward.ward_name}</td>
                  <td style={styles.td}>{ward.zone_code}</td>
                  <td style={styles.td}>{ward.zone_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Pagination calculations for filtered data
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(
    currentPage * itemsPerPage,
    filteredData.length,
  );
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
                disabled={filteredData.length == 0}
              >
                <FiPrinter className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
                disabled={filteredData.length == 0}
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
                  ? `Found ${filteredData.length} of ${allWardData.length} wards`
                  : `Total Wards: ${allWardData.length}`}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex space-x-2">
              <div className="border bg-white rounded-md flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <FiSearch className="h-4 w-4 text-gray-400" />
                <input
                  className="border-0 focus:outline-none text-sm w-64 px-2 py-1 bg-transparent"
                  placeholder="Search by code, name, zone..."
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <th className="p-3 border border-gray-200">Sr No</th>
                  <th className="p-3 border border-gray-200">Ward Code</th>
                  <th className="p-3 border border-gray-200">Ward Name</th>
                  <th className="p-3 border border-gray-200">Zone Code</th>
                  <th className="p-3 border border-gray-200">Zone Name</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading ward data...</p>
                    </td>
                  </tr>
                ) : filteredData.length == 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 bg-gray-50">
                      <div className="flex flex-col items-center">
                        <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchQuery
                            ? `No wards found matching "${searchQuery}"`
                            : "No ward data available"}
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
                  currentItems.map((ward, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-3 border border-gray-200 text-sm font-medium">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm">
                        {ward.ward_code}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm">
                        {ward.ward_name}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm">
                        {ward.zone_code}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm">
                        {ward.zone_name}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to {indexOfLastItem} of{" "}
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

export default Ward;
