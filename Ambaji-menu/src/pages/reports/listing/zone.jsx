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

const Zone = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [zoneData, setZoneData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTitle, setPageTitle] = useState("Zone List");
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
      const currentPath = "/reports/listing/zone";
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

  // Fetch zone data on component mount and page change
  useEffect(() => {
    fetchZoneData();
  }, [currentPage]);

  // Filter data based on search
  useEffect(() => {
    filterData();
  }, [zoneData, searchQuery]);

  const fetchZoneData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/zone-list`,
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
        setZoneData(response.data.data);
        setFilteredData(response.data.data);
        setPagination(response.data.pagination);
        setMessage({
          text: response.data.message || "Zone list loaded successfully",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Error fetching zone data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading zone data",
        type: "error",
      });
      setZoneData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (!zoneData.length) {
      setFilteredData([]);
      return;
    }

    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) {
      setFilteredData(zoneData);
      setCurrentPage(1);
      return;
    }

    const filtered = zoneData.filter(
      (zone) =>
        zone.zone_code?.toLowerCase().includes(searchLower) ||
        zone.zone_name?.toLowerCase().includes(searchLower),
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    if (filteredData.length == 0) {
      setMessage({
        text: "No data to export",
        type: "error",
      });
      return;
    }

    try {
      const wb = XLSX.utils.book_new();

      // Prepare data for Excel with Sr No, Zone Code, and Zone Name
      const excelData = [
        ["Sr No", "Zone Code", "Zone Name"],
        ...filteredData.map((zone, index) => [
          index + 1,
          zone.zone_code,
          zone.zone_name,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 8 }, // Sr No
        { wch: 15 }, // Zone Code
        { wch: 40 }, // Zone Name
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Zones");

      // Generate filename with current date
      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const filename = `Zone_List_${dateStamp}.xlsx`;

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

    return (
      <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
        {/* Summary */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            Zone List - {filteredData.length}{" "}
            {filteredData.length == 1 ? "zone" : "zones"}
            {filteredData.length != pagination.total &&
              ` (filtered from ${pagination.total} total)`}
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sr No</th>
                <th style={styles.th}>Zone Code</th>
                <th style={styles.th}>Zone Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((zone, index) => (
                <tr key={index}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{zone.zone_code}</td>
                  <td style={styles.td}>{zone.zone_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Pagination calculations
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
                {filteredData.length == pagination.total
                  ? `Total Zones: ${pagination.total}`
                  : `Showing ${filteredData.length} of ${pagination.total} zones`}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex space-x-2">
              <div className="border bg-white rounded-md flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <FiSearch className="h-4 w-4 text-gray-400" />
                <input
                  className="border-0 focus:outline-none text-sm w-full px-2 py-1 bg-transparent"
                  placeholder="Search by zone code or name..."
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
                  <th className="p-3 border border-gray-200">Sr No</th>
                  <th className="p-3 border border-gray-200">Zone Code</th>
                  <th className="p-3 border border-gray-200">Zone Name</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading zone data...</p>
                    </td>
                  </tr>
                ) : filteredData.length == 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 bg-gray-50">
                      <div className="flex flex-col items-center">
                        <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchQuery
                            ? `No zones found matching "${searchQuery}"`
                            : "No zone data available"}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((zone, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-3 border border-gray-200 text-sm font-medium">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm">
                        {zone.zone_code}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm">
                        {zone.zone_name}
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
                {filteredData.length != pagination.total &&
                  ` (filtered from ${pagination.total} total)`}
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

export default Zone;
