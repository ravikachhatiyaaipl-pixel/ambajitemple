import React, { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiX,
  FiPrinter,
  FiFileText,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiEye,
} from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";

const Ledger = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [pageTitle, setPageTitle] = useState("General Ledger Report");

  // Organisation data
  const [organisationData, setOrganisationData] = useState(null);

  // Ledger selection
  const [ledgers, setLedgers] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState("");
  const [showLedgerDropdown, setShowLedgerDropdown] = useState(false);
  const [ledgersLoading, setLedgersLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Date filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);

  // Print states
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");
  const [isPrintDataReady, setIsPrintDataReady] = useState(false);
  const [printData, setPrintData] = useState([]);

  // Get dynamic page title from menu details
  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/core-ledger/ledger";
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

  // Fetch organisation data
  useEffect(() => {
    fetchOrganisationData();
  }, []);

  // Fetch unique ledgers on component mount
  useEffect(() => {
    fetchUniqueLedgers();
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLedgerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter transactions when search or date filter changes
  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, fromDate, toDate]);

  // Fetch transactions when ledger is selected
  useEffect(() => {
    if (selectedLedger) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setFilteredTransactions([]);
    }
  }, [selectedLedger]);

  const fetchOrganisationData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/lst-org-master`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );
      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        setOrganisationData(response.data.data[0]);
      }
    } catch (err) {
      console.error("Error fetching organisation data:", err);
    }
  };

  // Fetch unique ledgers from API
  const fetchUniqueLedgers = async () => {
    setLedgersLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/finan-trns/all`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        // Extract unique ledgers from ledger (main) only
        const ledgerSet = new Map();
        const ledgersArray = [];

        response.data.data.forEach((transaction) => {
          // Only include transactions with v_mode = "G"
          if (transaction.V_Mode == "G") {
            // Get ledger from main ledger object only
            if (transaction.ledger && transaction.ledger.Lg_Id) {
              const ledgerId = transaction.ledger.Lg_Id;
              if (!ledgerSet.has(ledgerId)) {
                ledgerSet.set(ledgerId, true);
                ledgersArray.push({
                  id: transaction.ledger.Lg_Id,
                  name: transaction.ledger.Lg_Name,
                  englishName: transaction.ledger.Lg_Eng_Name,
                  code: transaction.ledger.Lg_Code,
                  group: transaction.ledger.Lg_Gr,
                  groupId: transaction.ledger.Gr_Id,
                });
              }
            }
          }
        });

        // Sort by ledger name
        ledgersArray.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setLedgers(ledgersArray);
      }
    } catch (err) {
      console.error("Error fetching unique ledgers:", err);
      setMessage({ text: "Error loading ledgers", type: "error" });
    } finally {
      setLedgersLoading(false);
    }
  };

  // Fetch transactions for selected ledger
  const fetchTransactions = async () => {
    if (!selectedLedger) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/finan-trns/all`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        // Filter transactions where selected ledger is the main ledger (Lg_Id) and v_mode = "G"
        const ledgerTransactions = response.data.data.filter((transaction) => {
          const isGMode = transaction.V_Mode == "G";
          const matchesLedger =
            transaction.ledger &&
            String(transaction.ledger.Lg_Id) == String(selectedLedger.id);
          return isGMode && matchesLedger;
        });

        // Map transactions to a consistent format
        const mappedTransactions = ledgerTransactions.map((transaction) => {
          // Parse date from ISO format to DD/MM/YYYY
          const dateObj = transaction.Vou_Dt
            ? new Date(transaction.Vou_Dt)
            : null;
          const formattedDate = dateObj ? formatDateToDDMMYYYY(dateObj) : "N/A";

          // Get opposite ledger (ref_ledger)
          let oppositeLedgerName = transaction.ref_ledger?.Lg_Name || "N/A";

          // Check if it's a sub-ledger transaction
          let voucherType = transaction.Vou_Ty || "N/A";
          if (transaction.V_Mode == "S") {
            voucherType = `${voucherType} (Sub-ledger)`;
          }

          return {
            id: transaction.Ft_Id,
            vou_id: transaction.Vou_Id,
            originalDate: transaction.Vou_Dt,
            date: formattedDate,
            description: transaction.rmk1 || "",
            debit: parseFloat(transaction.Dr_Amt) || 0,
            credit: parseFloat(transaction.Cr_Amt) || 0,
            ledgerName: transaction.ledger?.Lg_Name || "N/A",
            ledgerCode: transaction.ledger?.Lg_Code || "",
            oppositeLedgerName: oppositeLedgerName,
            oppositeLedgerCode: transaction.ref_ledger?.Lg_Code || "",
            voucherType: voucherType,
            subLedgerName: transaction.sub_ledger?.SL_Name || null,
            remarks: transaction.rmk2 || "",
          };
        });

        // Sort by date (newest first)
        mappedTransactions.sort((a, b) => {
          const dateA = new Date(a.originalDate);
          const dateB = new Date(b.originalDate);
          return dateB - dateA;
        });

        setTransactions(mappedTransactions);
        setFilteredTransactions(mappedTransactions);

        // setMessage({
        //   text: `Loaded ${mappedTransactions.length} transactions`,
        //   type: "success",
        // });
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setMessage({ text: "Error fetching transactions", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatDateToDDMMYYYY = (date) => {
    if (!date || isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filterTransactions = () => {
    if (!transactions.length) {
      setFilteredTransactions([]);
      return;
    }

    const searchLower = searchQuery.toLowerCase();

    const filtered = transactions.filter((transaction) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        (transaction.description &&
          transaction.description.toLowerCase().includes(searchLower)) ||
        (transaction.oppositeLedgerName &&
          transaction.oppositeLedgerName.toLowerCase().includes(searchLower)) ||
        (transaction.vou_id &&
          transaction.vou_id.toString().toLowerCase().includes(searchLower)) ||
        (transaction.debit &&
          transaction.debit.toString().includes(searchLower)) ||
        (transaction.credit &&
          transaction.credit.toString().includes(searchLower)) ||
        (transaction.voucherType &&
          transaction.voucherType.toLowerCase().includes(searchLower)) ||
        (transaction.subLedgerName &&
          transaction.subLedgerName.toLowerCase().includes(searchLower));

      // Date filter
      let matchesDate = true;
      if (fromDate || toDate) {
        const transactionDate = new Date(transaction.originalDate);
        if (!isNaN(transactionDate.getTime())) {
          if (fromDate) {
            const start = new Date(fromDate);
            start.setHours(0, 0, 0, 0);
            if (transactionDate < start) matchesDate = false;
          }
          if (toDate) {
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            if (transactionDate > end) matchesDate = false;
          }
        }
      }

      return matchesSearch && matchesDate;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (type, value) => {
    if (type == "from") {
      setFromDate(value);
    } else {
      setToDate(value);
    }
    setIsDateFilterActive(!!fromDate || !!toDate || !!value);
  };

  const resetDateFilter = () => {
    setFromDate("");
    setToDate("");
    setIsDateFilterActive(false);
  };

  const selectLedger = (ledger) => {
    setSelectedLedger(ledger);
    setShowLedgerDropdown(false);
    setLedgerSearchQuery("");
    setMessage({ text: "", type: "" });
  };

  const clearLedgerFilter = () => {
    setSelectedLedger(null);
    setTransactions([]);
    setFilteredTransactions([]);
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!selectedLedger || !filteredTransactions.length) {
      return { totalDebit: 0, totalCredit: 0, balance: 0 };
    }

    const totals = filteredTransactions.reduce(
      (acc, transaction) => ({
        totalDebit: acc.totalDebit + (transaction.debit || 0),
        totalCredit: acc.totalCredit + (transaction.credit || 0),
        balance:
          acc.balance + (transaction.credit || 0) - (transaction.debit || 0),
      }),
      { totalDebit: 0, totalCredit: 0, balance: 0 },
    );

    return totals;
  };

  // Fetch all data for print
  const fetchAllDataForPrint = async () => {
    setIsPrintDataReady(false);
    try {
      setPrintData(filteredTransactions);
    } catch (error) {
      console.error("Error preparing print data:", error);
      setMessage({
        text: "Error preparing print data",
        type: "error",
      });
    } finally {
      setIsPrintDataReady(true);
    }
  };

  // Handle print button click
  const handlePrintClick = () => {
    setShowPrint(true);
    fetchAllDataForPrint();
  };

  const exportToExcel = () => {
    if (!selectedLedger || filteredTransactions.length == 0) {
      setMessage({
        text: selectedLedger
          ? "No data to export"
          : "Please select a ledger first",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const totals = calculateTotals();

      const wb = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        {
          "Ledger Name": selectedLedger?.name || "N/A",
          "Ledger Code": selectedLedger?.code || "N/A",
          "Ledger Group": selectedLedger?.group || "N/A",
          "Total Transactions": filteredTransactions.length,
          "Total Debit (₹)": totals.totalDebit.toFixed(2),
          "Total Credit (₹)": totals.totalCredit.toFixed(2),
          "Net Balance (₹)": Math.abs(totals.balance).toFixed(2),
          "Balance Type": totals.balance >= 0 ? "Credit" : "Debit",
          "Date Range":
            fromDate && toDate ? `${fromDate} to ${toDate}` : "All Dates",
          "Report Generated": new Date().toLocaleString(),
        },
      ];

      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      // Details Sheet with running balance
      const detailsData = [
        [
          "Date",
          "Voucher ID",
          "Description",
          "Voucher Type",
          "Opposite Ledger",
          "Sub Ledger",
          "Debit (₹)",
          "Credit (₹)",
          "Running Balance (₹)",
        ],
      ];

      let runningBalance = 0;
      filteredTransactions.forEach((transaction) => {
        runningBalance =
          runningBalance + transaction.credit - transaction.debit;

        detailsData.push([
          transaction.date || "N/A",
          transaction.vou_id || "N/A",
          transaction.description || "",
          transaction.voucherType || "",
          transaction.oppositeLedgerName || "",
          transaction.subLedgerName || "",
          transaction.debit > 0 ? transaction.debit.toFixed(2) : "",
          transaction.credit > 0 ? transaction.credit.toFixed(2) : "",
          runningBalance.toFixed(2),
        ]);
      });

      // Add total row
      detailsData.push([
        "",
        "",
        "",
        "",
        "TOTAL:",
        "",
        totals.totalDebit.toFixed(2),
        totals.totalCredit.toFixed(2),
        totals.balance.toFixed(2),
      ]);

      const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);

      // Set column widths
      const colWidths = [
        { wch: 12 }, // Date
        { wch: 15 }, // Voucher ID
        { wch: 40 }, // Description
        { wch: 20 }, // Voucher Type
        { wch: 30 }, // Opposite Ledger
        { wch: 25 }, // Sub Ledger
        { wch: 15 }, // Debit
        { wch: 15 }, // Credit
        { wch: 18 }, // Running Balance
      ];
      detailsWs["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, detailsWs, "Ledger Details");

      // Generate filename
      const ledgerName = selectedLedger?.name?.replace(/\s+/g, "_") || "Ledger";
      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const filename = `Ledger_${ledgerName}_${dateStamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      // setMessage({
      //   text: `Excel report downloaded successfully! (${filteredTransactions.length} transactions)`,
      //   type: "success",
      // });
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

  // Print Report Content Component
  const PrintReportContent = () => {
    const styles = {
      section: { marginBottom: "20px", pageBreakInside: "avoid" },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "8px 0",
        fontSize: "11px",
      },
      th: {
        backgroundColor: "#f1f5f9",
        fontWeight: "600",
        padding: "8px 10px",
        border: "1px solid #cbd5e0",
        textAlign: "left",
        fontSize: "11px",
      },
      td: {
        padding: "6px 10px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textRight: { textAlign: "right" },
    };

    if (!isPrintDataReady) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <div style={{ marginTop: "20px" }}>
            Loading complete report data for print...
          </div>
        </div>
      );
    }

    if (printData.length == 0) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <FiAlertCircle
            style={{
              margin: "0 auto",
              width: "48px",
              height: "48px",
              color: "#9ca3af",
            }}
          />
          <div style={{ marginTop: "20px", color: "#6b7280" }}>
            No transactions found
          </div>
        </div>
      );
    }

    let runningBalance = 0;
    const totals = calculateTotals();

    return (
      <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
        {/* Ledger Information */}
        <div style={styles.section}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Ledger: {selectedLedger?.name} ({selectedLedger?.code})
          </h3>
          <table
            style={{ width: "100%", marginBottom: "15px", fontSize: "11px" }}
          >
            <tbody>
              <tr>
                <td>
                  <strong>Report Date:</strong>{" "}
                  {new Date().toLocaleDateString()}
                </td>
                <td>
                  <strong>Date Range:</strong>{" "}
                  {fromDate && toDate
                    ? `${fromDate} to ${toDate}`
                    : "All Dates"}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Total Transactions:</strong>{" "}
                  {filteredTransactions.length}
                </td>
                <td>
                  <strong>Ledger Group:</strong>{" "}
                  {selectedLedger?.group || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div style={styles.section}>
          <h4
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "4px",
            }}
          >
            Financial Summary
          </h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Total Debit</th>
                <th style={styles.th}>Total Credit</th>
                <th style={styles.th}>Net Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...styles.td, ...styles.textRight }}>
                  ₹{totals.totalDebit.toFixed(2)}
                </td>
                <td style={{ ...styles.td, ...styles.textRight }}>
                  ₹{totals.totalCredit.toFixed(2)}
                </td>
                <td style={{ ...styles.td, ...styles.textRight }}>
                  ₹{Math.abs(totals.balance).toFixed(2)}{" "}
                  {totals.balance >= 0 ? "Cr" : "Dr"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Transaction Details */}
        <div style={styles.section}>
          <h4
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "4px",
            }}
          >
            Transaction Details
          </h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Voucher ID</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Voucher Type</th>
                <th style={styles.th}>Opposite Ledger</th>
                <th style={styles.th}>Sub Ledger</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Debit</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Credit</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {printData.map((transaction) => {
                runningBalance =
                  runningBalance + transaction.credit - transaction.debit;

                return (
                  <tr key={transaction.id}>
                    <td style={styles.td}>{transaction.date}</td>
                    <td style={styles.td}>{transaction.vou_id}</td>
                    <td style={styles.td}>{transaction.description}</td>
                    <td style={styles.td}>{transaction.voucherType}</td>
                    <td style={styles.td}>{transaction.oppositeLedgerName}</td>
                    <td style={styles.td}>
                      {transaction.subLedgerName || "-"}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {transaction.debit > 0
                        ? `₹${transaction.debit.toFixed(2)}`
                        : "-"}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {transaction.credit > 0
                        ? `₹${transaction.credit.toFixed(2)}`
                        : "-"}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      ₹{runningBalance.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: "#f3f4f6", fontWeight: "bold" }}>
                <td colSpan="6" style={{ ...styles.td, textAlign: "right" }}>
                  TOTAL:
                </td>
                <td style={{ ...styles.td, ...styles.textRight }}>
                  ₹{totals.totalDebit.toFixed(2)}
                </td>
                <td style={{ ...styles.td, ...styles.textRight }}>
                  ₹{totals.totalCredit.toFixed(2)}
                </td>
                <td style={{ ...styles.td, ...styles.textRight }}>
                  ₹{Math.abs(totals.balance).toFixed(2)}{" "}
                  {totals.balance >= 0 ? "Cr" : "Dr"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  const filteredLedgers = ledgers.filter(
    (ledger) =>
      (ledger.name?.toLowerCase() || "").includes(
        ledgerSearchQuery.toLowerCase(),
      ) ||
      (ledger.code?.toLowerCase() || "").includes(
        ledgerSearchQuery.toLowerCase(),
      ) ||
      (ledger.englishName?.toLowerCase() || "").includes(
        ledgerSearchQuery.toLowerCase(),
      ),
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title={`${pageTitle} - ${selectedLedger?.name || ""}`}
          showControls={true}
          onClose={() => {
            setShowPrint(false);
            setIsPrintDataReady(false);
            setPrintData([]);
          }}
          organizationData={organisationData}
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

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type == "success"
                ? "bg-green-100 text-green-700"
                : message.type == "info"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"
            } flex justify-between items-center`}
          >
            <span className="flex items-center">
              {message.type == "success" ? (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              ) : (
                <FiAlertCircle className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </span>
            <button onClick={() => setMessage({ text: "", type: "" })}>
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{pageTitle}</h2>
            <div className="flex space-x-2">
              <button
                onClick={handlePrintClick}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
                disabled={!selectedLedger || filteredTransactions.length == 0}
              >
                <FiPrinter className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
                disabled={!selectedLedger || filteredTransactions.length == 0}
              >
                <FiFileText className="h-4 w-4 mr-2" />
                Excel
              </button>
            </div>
          </div>

          {/* Ledger Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ledger Selector */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Ledger <span className="text-red-500">*</span>
              </label>
              <div
                className="w-full border border-gray-300 rounded-md p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setShowLedgerDropdown(!showLedgerDropdown)}
              >
                <div>
                  {selectedLedger ? (
                    <>
                      <h3 className="font-medium text-gray-900">
                        {selectedLedger.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedLedger.englishName && (
                          <span className="mr-2">
                            ({selectedLedger.englishName})
                          </span>
                        )}
                        Code: {selectedLedger.code}
                      </p>
                    </>
                  ) : (
                    <span className="text-gray-500">
                      Click to select a ledger...
                    </span>
                  )}
                </div>
                {showLedgerDropdown ? (
                  <FiChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <FiChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {/* Dropdown List */}
              {showLedgerDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search ledgers..."
                        value={ledgerSearchQuery}
                        onChange={(e) => setLedgerSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {ledgersLoading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">
                          Loading ledgers...
                        </p>
                      </div>
                    ) : filteredLedgers.length == 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {ledgerSearchQuery
                          ? "No matching ledgers found"
                          : "No ledgers available"}
                      </div>
                    ) : (
                      filteredLedgers.map((ledger) => (
                        <div
                          key={ledger.id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedLedger?.id == ledger.id ? "bg-blue-50" : ""
                          }`}
                          onClick={() => selectLedger(ledger)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {ledger.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {ledger.englishName && (
                                  <span className="mr-2">
                                    ({ledger.englishName})
                                  </span>
                                )}
                                Code: {ledger.code}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {ledger.group}
                              </p>
                            </div>
                            {selectedLedger?.id == ledger.id && (
                              <FiEye className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Clear selection button */}
                  <div className="p-2 border-t flex justify-between">
                    {selectedLedger && (
                      <button
                        onClick={clearLedgerFilter}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Clear Selection
                      </button>
                    )}
                    <button
                      onClick={() => setShowLedgerDropdown(false)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-auto"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Date Range Filters - Only show if ledger is selected */}
            {selectedLedger && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) =>
                      handleDateFilterChange("from", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) =>
                        handleDateFilterChange("to", e.target.value)
                      }
                      className="flex-1 border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    {isDateFilterActive && (
                      <button
                        onClick={resetDateFilter}
                        className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Empty div for spacing */}
                <div></div>
              </>
            )}
          </div>
        </div>

        {/* Main Table Card - Only show if ledger is selected */}
        {selectedLedger && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Transactions: {filteredTransactions.length}
                </div>
                {searchQuery && (
                  <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Filtered: {filteredTransactions.length} results
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <div className="border bg-white rounded-md flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                  <input
                    className="border-0 focus:outline-none text-sm w-full px-2 py-1 bg-transparent"
                    placeholder="Search transactions..."
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

                <button
                  onClick={fetchTransactions}
                  disabled={loading}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  title="Refresh"
                >
                  <FiRefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <th className="p-3 border border-gray-200">Date</th>
                    <th className="p-3 border border-gray-200">Voucher ID</th>
                    <th className="p-3 border border-gray-200">Description</th>
                    <th className="p-3 border border-gray-200">Voucher Type</th>
                    <th className="p-3 border border-gray-200">
                      Opposite Ledger
                    </th>
                    <th className="p-3 border border-gray-200">Sub Ledger</th>
                    <th className="p-3 border border-gray-200 text-right">
                      Debit (₹)
                    </th>
                    <th className="p-3 border border-gray-200 text-right">
                      Credit (₹)
                    </th>
                    <th className="p-3 border border-gray-200 text-right">
                      Balance (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500">
                          Loading transactions...
                        </p>
                      </td>
                    </tr>
                  ) : currentItems.length == 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8 bg-gray-50">
                        <div className="flex flex-col items-center">
                          <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-500">
                            {searchQuery
                              ? `No transactions found matching "${searchQuery}"`
                              : "No transactions found for the selected ledger"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {currentItems.map((transaction, index) => {
                        // Calculate running balance
                        const previousTransactions = filteredTransactions.slice(
                          0,
                          indexOfFirstItem + index,
                        );
                        const previousBalance = previousTransactions.reduce(
                          (sum, t) => sum + t.credit - t.debit,
                          0,
                        );
                        const currentBalance =
                          previousBalance +
                          transaction.credit -
                          transaction.debit;

                        return (
                          <tr
                            key={transaction.id}
                            className="hover:bg-blue-50 transition-colors"
                          >
                            <td className="p-3 border border-gray-200 text-sm">
                              {transaction.date}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm font-medium">
                              {transaction.vou_id || "N/A"}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                              {transaction.description || ""}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                              <span className="font-medium">
                                {transaction.voucherType}
                              </span>
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                              <span className="font-medium">
                                {transaction.oppositeLedgerName}
                              </span>
                            </td>
                            <td className="p-3 border border-gray-200 text-sm">
                              {transaction.subLedgerName || "-"}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm text-right font-medium text-red-600">
                              {transaction.debit > 0
                                ? `₹${transaction.debit.toFixed(2)}`
                                : ""}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm text-right font-medium text-green-600">
                              {transaction.credit > 0
                                ? `₹${transaction.credit.toFixed(2)}`
                                : ""}
                            </td>
                            <td className="p-3 border border-gray-200 text-sm text-right font-medium">
                              ₹{currentBalance.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Totals Row */}
                      {currentItems.length > 0 && (
                        <tr className="bg-gray-50 font-semibold">
                          <td
                            colSpan="6"
                            className="p-3 border border-gray-200 text-right"
                          >
                            TOTAL:
                          </td>
                          <td className="p-3 border border-gray-200 text-right text-red-600">
                            ₹{totals.totalDebit.toFixed(2)}
                          </td>
                          <td className="p-3 border border-gray-200 text-right text-green-600">
                            ₹{totals.totalCredit.toFixed(2)}
                          </td>
                          <td className="p-3 border border-gray-200 text-right">
                            ₹{Math.abs(totals.balance).toFixed(2)}{" "}
                            {totals.balance >= 0 ? "Cr" : "Dr"}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredTransactions.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, filteredTransactions.length)} of{" "}
                  {filteredTransactions.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage == 1 || loading}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage == 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-100"
                    } transition-colors`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage == 1 || loading}
                    className={`p-2 rounded-md ${
                      currentPage == 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-100"
                    } transition-colors`}
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </button>

                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage == totalPages || loading}
                    className={`p-2 rounded-md ${
                      currentPage == totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-100"
                    } transition-colors`}
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage == totalPages || loading}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage == totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-100"
                    } transition-colors`}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ledger;
