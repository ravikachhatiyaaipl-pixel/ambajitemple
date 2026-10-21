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

const User = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [userData, setUserData] = useState([]);
  const [allUserData, setAllUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageTitle, setPageTitle] = useState("User List");
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
      const currentPath = "/reports/listing/user";
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

  // Fetch user data on component mount and page change
  useEffect(() => {
    fetchUserData();
  }, [currentPage]);

  // Fetch all data for search and print when component mounts
  useEffect(() => {
    fetchAllUserData();
  }, []);

  // Filter data based on search query
  useEffect(() => {
    if (allUserData.length > 0) {
      filterData();
    }
  }, [searchQuery, allUserData]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/user-list`,
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
        setUserData(response.data.data);
        setPagination(response.data.pagination);
        setMessage({
          text: response.data.message || "User list loaded successfully",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setMessage({
        text: err.response?.data?.message || "Error loading user data",
        type: "error",
      });
      setUserData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUserData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/reports/user-list`,
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
        setAllUserData(response.data.data);
        setFilteredData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching all user data:", err);
    }
  };

  // Filter function
  const filterData = () => {
    if (!searchQuery.trim()) {
      setFilteredData(allUserData);
      setCurrentPage(1);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allUserData.filter(
      (user) =>
        user.user_name?.toLowerCase().includes(query) ||
        user.user_email?.toLowerCase().includes(query) ||
        user.user_mobile?.toLowerCase().includes(query) ||
        user.role_name?.toLowerCase().includes(query) ||
        user.role_prefix?.toLowerCase().includes(query) ||
        user.account_status?.toLowerCase().includes(query) ||
        (user.last_login && user.last_login.toLowerCase().includes(query)),
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setFilteredData(allUserData);
    setCurrentPage(1);
  };

  const exportToExcel = async () => {
    setLoading(true);
    try {
      const dataToExport = searchQuery ? filteredData : allUserData;

      if (dataToExport.length == 0) {
        setMessage({
          text: "No data to export",
          type: "error",
        });
        return;
      }

      const wb = XLSX.utils.book_new();

      // Prepare data for Excel with clean headers
      const excelData = [
        [
          "Sr No",
          "User Name",
          "Email",
          "Mobile",
          "Role",
          "Status",
          "Last Login",
        ],
        ...dataToExport.map((user, index) => [
          index + 1,
          user.user_name,
          user.user_email,
          user.user_mobile,
          user.role_name,
          user.account_status,
          user.last_login || "-",
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 8 }, // Sr No
        { wch: 25 }, // User Name
        { wch: 30 }, // Email
        { wch: 15 }, // Mobile
        { wch: 25 }, // Role
        { wch: 12 }, // Status
        { wch: 20 }, // Last Login
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Users");

      // Generate filename with current date
      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const searchSuffix = searchQuery ? `_filtered` : "";
      const filename = `User_List${searchSuffix}_${dateStamp}.xlsx`;

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
      statusActive: {
        backgroundColor: "#dcfce7",
        color: "#166534",
        padding: "2px 8px",
        borderRadius: "12px",
        fontSize: "10px",
        fontWeight: "600",
        display: "inline-block",
      },
      statusInactive: {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        padding: "2px 8px",
        borderRadius: "12px",
        fontSize: "10px",
        fontWeight: "600",
        display: "inline-block",
      },
    };

    const dataToPrint = filteredData;

    return (
      <div style={styles.container}>
        {/* Section Title */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            User List - {dataToPrint.length}{" "}
            {dataToPrint.length == 1 ? "User" : "Users"}
            {searchQuery && ` (Filtered by: "${searchQuery}")`}
          </div>

          {/* Table */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Sr. No.</th>
                <th style={styles.th}>User Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Mobile</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {dataToPrint.map((user, index) => (
                <tr key={index}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{user.user_name || "-"}</td>
                  <td style={styles.td}>{user.user_email || "-"}</td>
                  <td style={styles.td}>{user.user_mobile || "-"}</td>
                  <td style={styles.td}>{user.role_name || "-"}</td>
                  <td style={styles.td}>
                    <span
                      style={
                        user.account_status == "Active"
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {user.account_status || "-"}
                    </span>
                  </td>
                  <td style={styles.td}>{user.last_login || "-"}</td>
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

  // Status color class function
  const getStatusColor = (status) => {
    return status == "Active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

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
                  ? `Found ${filteredData.length} of ${allUserData.length} users`
                  : `Total Users: ${allUserData.length}`}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex space-x-2">
              <div className="border bg-white rounded-md flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <FiSearch className="h-4 w-4 text-gray-400" />
                <input
                  className="border-0 focus:outline-none text-sm w-64 px-2 py-1 bg-transparent"
                  placeholder="Search by name, email, role, status..."
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
                  <th className="p-3 border border-gray-200">Sr. No.</th>
                  <th className="p-3 border border-gray-200">User Name</th>
                  <th className="p-3 border border-gray-200">Email</th>
                  <th className="p-3 border border-gray-200">Mobile</th>
                  <th className="p-3 border border-gray-200">Role</th>
                  <th className="p-3 border border-gray-200">Status</th>
                  <th className="p-3 border border-gray-200">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading user data...</p>
                    </td>
                  </tr>
                ) : filteredData.length == 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 bg-gray-50">
                      <div className="flex flex-col items-center">
                        <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchQuery
                            ? `No users found matching "${searchQuery}"`
                            : "No user data available"}
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
                  currentItems.map((user, index) => {
                    const serialNo = indexOfFirstItem + index + 1;
                    return (
                      <tr
                        key={user.user_email || index}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="p-3 border border-gray-200 text-sm font-medium text-center">
                          {serialNo}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm font-medium">
                          {user.user_name}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {user.user_email}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {user.user_mobile}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {user.role_name}
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.account_status)}`}
                          >
                            {user.account_status}
                          </span>
                        </td>
                        <td className="p-3 border border-gray-200 text-sm">
                          {user.last_login || "-"}
                        </td>
                      </tr>
                    );
                  })
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

export default User;
