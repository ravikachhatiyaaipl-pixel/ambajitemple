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

const Area = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [areaData, setAreaData] = useState([]);
  const [allAreaData, setAllAreaData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTitle, setPageTitle] = useState("Area List");
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
      const currentPath = "/reports/listing/area";
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

  // Fetch area data on component mount and page change
  useEffect(() => {
    fetchAreaData();
  }, [currentPage]);

  // Fetch all data for search and print when component mounts
  useEffect(() => {
    fetchAllAreaData();
  }, []);

  // Filter data based on search query
  useEffect(() => {
    if (allAreaData.length > 0) {
      filterData();
    }
  }, [searchQuery, allAreaData]);

  const fetchAreaData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/area-list`,
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
        setAreaData(response.data.data);
        setPagination(response.data.pagination);
        setMessage({
          text: response.data.message || "Area list loaded successfully",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Error fetching area data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading area data",
        type: "error",
      });
      setAreaData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAreaData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/area-list`,
        {
          params: {
            page: 1,
            per_page: 1000, // Get all records
          },
           headers : { 
              "Authorization": `Bearer ${localStorage.getItem("auth_token")}` 
          } 
        },
      );

      if (response.data.success) {
        setAllAreaData(response.data.data);
        setFilteredData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching all area data:", err);
    }
  };

  // Filter function
  const filterData = () => {
    if (!searchQuery.trim()) {
      setFilteredData(allAreaData);
      setCurrentPage(1);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allAreaData.filter(
      (area) =>
        area.area_code?.toLowerCase().includes(query) ||
        area.area_name?.toLowerCase().includes(query) ||
        area.ward_code?.toLowerCase().includes(query) ||
        area.ward_name?.toLowerCase().includes(query) ||
        area.zone_code?.toLowerCase().includes(query) ||
        area.zone_name?.toLowerCase().includes(query),
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredData(allAreaData);
    setCurrentPage(1);
  };

  const exportToExcel = async () => {
    setLoading(true);
    try {
      const dataToExport = searchQuery ? filteredData : allAreaData;

      if (dataToExport.length == 0) {
        setMessage({
          text: "No data to export",
          type: "error",
        });
        return;
      }

      const wb = XLSX.utils.book_new();

      // Prepare data for Excel with clean headers - Added S.No. column
      const excelData = [
        [
          "S.No.",
          "Area Code",
          "Area Name",
          "Ward Code",
          "Ward Name",
          "Zone Code",
          "Zone Name",
        ],
        ...dataToExport.map((area, index) => [
          index + 1,
          area.area_code,
          area.area_name,
          area.ward_code,
          area.ward_name,
          area.zone_code,
          area.zone_name,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Set column widths - Updated for S.No. column
      const colWidths = [
        { wch: 8 }, // S.No.
        { wch: 12 }, // Area Code
        { wch: 25 }, // Area Name
        { wch: 12 }, // Ward Code
        { wch: 20 }, // Ward Name
        { wch: 12 }, // Zone Code
        { wch: 20 }, // Zone Name
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Areas");

      // Generate filename with current date
      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const searchSuffix = searchQuery ? `_filtered` : "";
      const filename = `Area_List${searchSuffix}_${dateStamp}.xlsx`;

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

    const dataToPrint = filteredData;

    return (
      <div style={styles.container}>
        {/* Section Title */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            Area List - {dataToPrint.length}{" "}
            {dataToPrint.length == 1 ? "Area" : "Areas"}
            {searchQuery && ` (Filtered by: "${searchQuery}")`}
          </div>

          {/* Table */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>S.No.</th>
                <th style={styles.th}>Area Code</th>
                <th style={styles.th}>Area Name</th>
                <th style={styles.th}>Ward Code</th>
                <th style={styles.th}>Ward Name</th>
                <th style={styles.th}>Zone Code</th>
                <th style={styles.th}>Zone Name</th>
              </tr>
            </thead>
            <tbody>
              {dataToPrint.map((area, index) => (
                <tr key={index}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{area.area_code || "-"}</td>
                  <td style={styles.td}>{area.area_name || "-"}</td>
                  <td style={styles.td}>{area.ward_code || "-"}</td>
                  <td style={styles.td}>{area.ward_name || "-"}</td>
                  <td style={styles.td}>{area.zone_code || "-"}</td>
                  <td style={styles.td}>{area.zone_name || "-"}</td>
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
                  ? `Found ${filteredData.length} of ${allAreaData.length} areas`
                  : `Total Areas: ${allAreaData.length}`}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex space-x-2">
              <div className="border bg-white rounded-md flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <FiSearch className="h-4 w-4 text-gray-400" />
                <input
                  className="border-0 focus:outline-none text-sm w-64 px-2 py-1 bg-transparent"
                  placeholder="Search by code, name, ward, zone..."
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
                  <th className="p-3 border border-gray-200">S.No.</th>
                  <th className="p-3 border border-gray-200">Area Code</th>
                  <th className="p-3 border border-gray-200">Area Name</th>
                  <th className="p-3 border border-gray-200">Ward Code</th>
                  <th className="p-3 border border-gray-200">Ward Name</th>
                  <th className="p-3 border border-gray-200">Zone Code</th>
                  <th className="p-3 border border-gray-200">Zone Name</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading area data...</p>
                    </td>
                  </tr>
                ) : filteredData.length == 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 bg-gray-50">
                      <div className="flex flex-col items-center">
                        <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchQuery
                            ? `No areas found matching "${searchQuery}"`
                            : "No area data available"}
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
                  currentItems.map((area, index) => (
                    <tr
                      key={area.area_id || index}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-3 border border-gray-200 text-sm font-medium">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm font-medium">
                        {area.area_code}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm">
                        {area.area_name}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm">
                        {area.ward_code}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm">
                        {area.ward_name}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm">
                        {area.zone_code}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm">
                        {area.zone_name}
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

export default Area;
