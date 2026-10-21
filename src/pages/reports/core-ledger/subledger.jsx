"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiAlertCircle,
  FiX,
  FiCalendar,
  FiEye,
  FiChevronUp,
  FiPrinter,
  FiFileText,
  FiCheck,
} from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";

const SubLedger = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [transactions, setTransactions] = useState([]);
  const [uniqueLedgers, setUniqueLedgers] = useState([]);
  const [uniqueAgents, setUniqueAgents] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);

  // Voucher type filter
  const [selectedVoucherType, setSelectedVoucherType] = useState("");
  const [uniqueVoucherTypes, setUniqueVoucherTypes] = useState([]);

  // Organisation data
  const [organisationData, setOrganisationData] = useState(null);

  // Dropdown states
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [agentSearch, setAgentSearch] = useState("");
  const [showLedgerDropdown, setShowLedgerDropdown] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [ledgersLoading, setLedgersLoading] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(false);

  // Arrow key navigation states
  const [selectedLedgerIndex, setSelectedLedgerIndex] = useState(-1);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(-1);

  // Print and Export states
  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("portrait");

  // Generate button state
  const [hasGenerated, setHasGenerated] = useState(false);

  const ledgerDropdownRef = useRef(null);
  const agentDropdownRef = useRef(null);
  const ledgerInputRef = useRef(null);
  const agentInputRef = useRef(null);
  const ledgerListRef = useRef(null);
  const agentListRef = useRef(null);

  // Get API base URL from environment
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch organisation data
  useEffect(() => {
    fetchOrganisationData();
  }, []);

  // Fetch unique ledgers that have sub-ledgers
  useEffect(() => {
    fetchUniqueLedgers();
  }, []);

  // Fetch agents when ledger is selected
  useEffect(() => {
    if (selectedLedger) {
      fetchUniqueAgents();
    } else {
      setUniqueAgents([]);
      setSelectedAgent(null);
    }
  }, [selectedLedger]);

  // Fetch transactions when agent is selected AND generate button has been clicked
  useEffect(() => {
    if (selectedAgent && selectedLedger && hasGenerated) {
      fetchTransactionsFromAPI();
    } else {
      setTransactions([]);
      setFilteredTransactions([]);
    }
  }, [
    selectedAgent,
    selectedLedger,
    startDate,
    endDate,
    selectedVoucherType,
    hasGenerated,
  ]);

  // Filter transactions when search changes
  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery]);

  // Extract unique voucher types from transactions
  useEffect(() => {
    if (transactions.length > 0) {
      const voucherTypes = [
        ...new Set(transactions.map((t) => t.voucher_type).filter((v) => v)),
      ];
      setUniqueVoucherTypes(voucherTypes);
    } else {
      setUniqueVoucherTypes([]);
    }
  }, [transactions]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedLedgerIndex(-1);
  }, [ledgerSearch]);

  useEffect(() => {
    setSelectedAgentIndex(-1);
  }, [agentSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ledgerDropdownRef.current &&
        !ledgerDropdownRef.current.contains(event.target)
      ) {
        setShowLedgerDropdown(false);
        setSelectedLedgerIndex(-1);
      }
      if (
        agentDropdownRef.current &&
        !agentDropdownRef.current.contains(event.target)
      ) {
        setShowAgentDropdown(false);
        setSelectedAgentIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll selected item into view for ledger dropdown
  useEffect(() => {
    if (selectedLedgerIndex >= 0 && ledgerListRef.current) {
      const selectedElement =
        ledgerListRef.current.children[selectedLedgerIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedLedgerIndex]);

  // Scroll selected item into view for agent dropdown
  useEffect(() => {
    if (selectedAgentIndex >= 0 && agentListRef.current) {
      const selectedElement = agentListRef.current.children[selectedAgentIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedAgentIndex]);

  const fetchOrganisationData = async () => {
    try {
      const response = await axios.get(`${API_URL}/lst-org-master`,{ headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } });
      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        setOrganisationData(response.data.data[0]);
      }
    } catch (err) {
      console.error("Error fetching organisation data:", err);
      setMessage({ text: "Failed to load organisation data", type: "error" });
    }
  };

  const fetchUniqueLedgers = async () => {
    setLedgersLoading(true);
    try {
      const response = await axios.get(`${API_URL}/finan-trns/all`, { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } });

      if (response.data.success && Array.isArray(response.data.data)) {
        const ledgerSet = new Map();
        const ledgersArray = [];

        response.data.data.forEach((transaction) => {
          if (transaction.V_Mode == "S" && transaction.ledger) {
            const ledgerId = transaction.ledger.Lg_Id;
            if (!ledgerSet.has(ledgerId)) {
              ledgerSet.set(ledgerId, true);
              ledgersArray.push({
                Lg_Id: transaction.ledger.Lg_Id,
                Lg_Name: transaction.ledger.Lg_Name,
                Lg_Code: transaction.ledger.Lg_Code,
                Lg_Gr: transaction.ledger.Lg_Gr,
                Gr_Id: transaction.ledger.Gr_Id,
                Lg_Eng_Name: transaction.ledger.Lg_Eng_Name,
              });
            }
          }
        });

        ledgersArray.sort((a, b) =>
          (a.Lg_Name || "").localeCompare(b.Lg_Name || ""),
        );

        setUniqueLedgers(ledgersArray);
      }
    } catch (err) {
      console.error("Error fetching unique ledgers:", err);
      setMessage({ text: "Error loading ledgers", type: "error" });
    } finally {
      setLedgersLoading(false);
    }
  };

  const fetchUniqueAgents = async () => {
    if (!selectedLedger) return;

    setAgentsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/finan-trns/all`, { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } });

      if (response.data.success && Array.isArray(response.data.data)) {
        const agentSet = new Map();
        const agentsArray = [];

        response.data.data.forEach((transaction) => {
          if (transaction.V_Mode == "S" && transaction.sub_ledger) {
            const ledgerId = transaction.sub_ledger.Lg_Id;
            const ledgerIdArray = Array.isArray(ledgerId)
              ? ledgerId
              : [ledgerId];

            if (ledgerIdArray.includes(Number(selectedLedger.Lg_Id))) {
              const agentId = transaction.sub_ledger.SL_Id;
              if (!agentSet.has(agentId)) {
                agentSet.set(agentId, true);
                agentsArray.push({
                  SL_Id: transaction.sub_ledger.SL_Id,
                  SL_Code: transaction.sub_ledger.SL_Code || "",
                  SL_Name: transaction.sub_ledger.SL_Name || "",
                  SL_Address: transaction.sub_ledger.SL_Address,
                  SL_Phone: transaction.sub_ledger.SL_Phone,
                  SL_Email: transaction.sub_ledger.SL_Email,
                  Lg_Id: transaction.sub_ledger.Lg_Id,
                  PAN_Number: transaction.sub_ledger.PAN_Number,
                  GSTIN: transaction.sub_ledger.GSTIN,
                  Bank_Name: transaction.sub_ledger.Bank_Name,
                  Account_Number: transaction.sub_ledger.Account_Number,
                });
              }
            }
          }
        });

        agentsArray.sort((a, b) =>
          (a.SL_Name || "").localeCompare(b.SL_Name || ""),
        );

        setUniqueAgents(agentsArray);
      }
    } catch (err) {
      console.error("Error fetching unique agents:", err);
      setMessage({ text: "Error loading sub-ledgers", type: "error" });
    } finally {
      setAgentsLoading(false);
    }
  };

  const fetchTransactionsFromAPI = async () => {
    if (!selectedAgent || !selectedLedger) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("ledger_id", selectedLedger.Lg_Id);
      params.append("sub_ledger_id", selectedAgent.SL_Id);

      if (startDate) params.append("from_date", startDate);
      if (endDate) params.append("to_date", endDate);
      if (selectedVoucherType)
        params.append("voucher_type", selectedVoucherType);

      const response = await axios.get(
        `${API_URL}/reports/sub-ledger?${params.toString()}`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );

      if (response.data.success && response.data.data) {
        const apiData = response.data.data;

        const mappedTransactions = (apiData.transactions || []).map(
          (transaction) => ({
            id: transaction.id,
            originalDate: transaction.date,
            date: transaction.formatted_date || transaction.date,
            description: transaction.description || "",
            debit: parseFloat(transaction.debit) || 0,
            credit: parseFloat(transaction.credit) || 0,
            formatted_debit: transaction.formatted_debit || "",
            formatted_credit: transaction.formatted_credit || "",
            voucher_type: transaction.voucher_type || "",
            voucher_no: transaction.voucher_no || "",
            voucher_serial: transaction.voucher_serial || "",
            opposite_ledger: transaction.opposite_ledger || "N/A",
            running_balance: transaction.running_balance || 0,
            formatted_running_balance:
              transaction.formatted_running_balance || "",
            balance_type: transaction.balance_type || "",
          }),
        );

        setTransactions(mappedTransactions);

        // setMessage({ text: "Data loaded successfully", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setTransactions([]);
        setMessage({
          text: "No data found for the selected criteria",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Error fetching transactions from API:", err);
      setMessage({
        text: err.response?.data?.message || "Error fetching transactions",
        type: "error",
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    if (!transactions.length) {
      setFilteredTransactions([]);
      return;
    }

    const searchLower = searchQuery.toLowerCase();

    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        !searchQuery ||
        (transaction.description &&
          transaction.description.toLowerCase().includes(searchLower)) ||
        (transaction.opposite_ledger &&
          transaction.opposite_ledger.toLowerCase().includes(searchLower)) ||
        (transaction.debit &&
          transaction.debit.toString().includes(searchLower)) ||
        (transaction.credit &&
          transaction.credit.toString().includes(searchLower)) ||
        (transaction.voucher_no &&
          transaction.voucher_no.toString().includes(searchLower)) ||
        (transaction.voucher_type &&
          transaction.voucher_type.toLowerCase().includes(searchLower));

      return matchesSearch;
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (type, value) => {
    if (type == "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    setIsDateFilterActive(!!startDate || !!endDate || !!value);
    if (hasGenerated) setHasGenerated(false);
  };

  const resetDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setIsDateFilterActive(false);
    if (hasGenerated) setHasGenerated(false);
  };

  const resetVoucherTypeFilter = () => {
    setSelectedVoucherType("");
    if (hasGenerated) setHasGenerated(false);
  };

  const resetAllFilters = () => {
    resetDateFilter();
    resetVoucherTypeFilter();
  };

  const handleGenerateReport = () => {
    if (!selectedLedger) {
      setMessage({ text: "Please select a head ledger.", type: "info" });
      return;
    }
    if (!selectedAgent) {
      setMessage({ text: "Please select a sub-ledger.", type: "info" });
      return;
    }
    setHasGenerated(true);
    setMessage({ text: "", type: "" });
  };

  const handleLedgerSelect = (ledger) => {
    setSelectedLedger(ledger);
    setSelectedAgent(null);
    setShowLedgerDropdown(false);
    setLedgerSearch("");
    setSelectedLedgerIndex(-1);
    setTransactions([]);
    setFilteredTransactions([]);
    setHasGenerated(false);
    setMessage({ text: "", type: "" });
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setShowAgentDropdown(false);
    setAgentSearch("");
    setSelectedAgentIndex(-1);
    setHasGenerated(false);
    setMessage({ text: "", type: "" });
  };

  const handleClearLedgerSelection = () => {
    setSelectedLedger(null);
    setSelectedAgent(null);
    setShowLedgerDropdown(false);
    setLedgerSearch("");
    setSelectedLedgerIndex(-1);
    setTransactions([]);
    setFilteredTransactions([]);
    setHasGenerated(false);
  };

  const handleClearAgentSelection = () => {
    setSelectedAgent(null);
    setShowAgentDropdown(false);
    setAgentSearch("");
    setSelectedAgentIndex(-1);
    setTransactions([]);
    setFilteredTransactions([]);
    setHasGenerated(false);
  };

  const handleLedgerKeyDown = (e) => {
    if (!showLedgerDropdown) return;

    const items = filteredLedgers;
    const itemCount = items.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedLedgerIndex((prev) =>
          prev < itemCount - 1 ? prev + 1 : prev,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedLedgerIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case "Enter":
        e.preventDefault();
        if (selectedLedgerIndex >= 0 && selectedLedgerIndex < itemCount) {
          handleLedgerSelect(items[selectedLedgerIndex]);
        } else if (itemCount > 0) {
          handleLedgerSelect(items[0]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setShowLedgerDropdown(false);
        setLedgerSearch("");
        setSelectedLedgerIndex(-1);
        break;

      default:
        break;
    }
  };

  const handleAgentKeyDown = (e) => {
    if (!showAgentDropdown) return;

    const items = filteredAgents;
    const itemCount = items.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedAgentIndex((prev) =>
          prev < itemCount - 1 ? prev + 1 : prev,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedAgentIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case "Enter":
        e.preventDefault();
        if (selectedAgentIndex >= 0 && selectedAgentIndex < itemCount) {
          handleAgentSelect(items[selectedAgentIndex]);
        } else if (itemCount > 0) {
          handleAgentSelect(items[0]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setShowAgentDropdown(false);
        setAgentSearch("");
        setSelectedAgentIndex(-1);
        break;

      default:
        break;
    }
  };

  const calculateTotals = () => {
    if (!selectedAgent || !filteredTransactions.length) {
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

  const calculateStatistics = () => {
    if (!selectedAgent || !filteredTransactions.length) {
      return {
        totalTransactions: 0,
        oldestDate: "",
        newestDate: "",
        highestDebit: 0,
        highestCredit: 0,
      };
    }

    const dates = filteredTransactions
      .map((t) => {
        let dateStr = t.originalDate || t.date;
        if (dateStr.includes("/")) {
          const parts = dateStr.split("/");
          return new Date(parts[2], parts[1] - 1, parts[0]);
        } else if (dateStr.includes("-")) {
          const parts = dateStr.split("-");
          return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        return null;
      })
      .filter((date) => date && !isNaN(date.getTime()));

    const debits = filteredTransactions.map((t) => t.debit || 0);
    const credits = filteredTransactions.map((t) => t.credit || 0);

    let oldestDate = "";
    let newestDate = "";

    if (dates.length > 0) {
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
      oldestDate = formatDate(new Date(Math.min(...dates)));
      newestDate = formatDate(new Date(Math.max(...dates)));
    }

    return {
      totalTransactions: filteredTransactions.length,
      oldestDate,
      newestDate,
      highestDebit: Math.max(...debits, 0),
      highestCredit: Math.max(...credits, 0),
    };
  };

  const exportToExcel = () => {
    if (!selectedAgent || filteredTransactions.length == 0) {
      setMessage({
        text: selectedAgent
          ? "No data to export"
          : "Please select a sub-ledger first",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const totals = calculateTotals();

      const wb = XLSX.utils.book_new();

      const summaryData = [
        {
          "Sub-Ledger Name": selectedAgent?.SL_Name || "N/A",
          "Sub-Ledger Code": selectedAgent?.SL_Code || "N/A",
          "PAN Number": selectedAgent?.PAN_Number || "N/A",
          GSTIN: selectedAgent?.GSTIN || "N/A",
          "Ledger Name": selectedLedger?.Lg_Name || "N/A",
          "Total Transactions": filteredTransactions.length,
          "Total Debit (₹)": totals.totalDebit.toFixed(2),
          "Total Credit (₹)": totals.totalCredit.toFixed(2),
          "Net Balance (₹)": Math.abs(totals.balance).toFixed(2),
          "Balance Type": totals.balance >= 0 ? "Credit" : "Debit",
          "Date Range": isDateFilterActive
            ? `${startDate || "Start"} to ${endDate || "End"}`
            : "All Dates",
          "Voucher Type Filter": selectedVoucherType || "All",
          "Report Generated": new Date().toLocaleString(),
        },
      ];

      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      const detailsData = [
        [
          "Date",
          "Description",
          "Voucher Type",
          "Voucher No",
          "Opposite Ledger",
          "Debit (₹)",
          "Credit (₹)",
          "Running Balance (₹)",
        ],
      ];

      filteredTransactions.forEach((transaction) => {
        detailsData.push([
          transaction.date || "N/A",
          transaction.description || "",
          transaction.voucher_type || "",
          transaction.voucher_no || "",
          transaction.opposite_ledger || "",
          transaction.debit > 0 ? transaction.debit.toFixed(2) : "",
          transaction.credit > 0 ? transaction.credit.toFixed(2) : "",
          transaction.formatted_running_balance || "",
        ]);
      });

      detailsData.push([
        "",
        "",
        "",
        "",
        "TOTAL:",
        totals.totalDebit.toFixed(2),
        totals.totalCredit.toFixed(2),
        totals.balance.toFixed(2),
      ]);

      const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);
      XLSX.utils.book_append_sheet(wb, detailsWs, "Transaction Details");

      const agentName = selectedAgent
        ? selectedAgent.SL_Name.replace(/\s+/g, "_")
        : "SubLedger";
      const dateStamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const filename = `SubLedger_${agentName}_${dateStamp}.xlsx`;

      XLSX.writeFile(wb, filename);

      setMessage({
        text: `Excel report downloaded successfully!`,
        type: "success",
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
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
    const totals = calculateTotals();
    const stats = calculateStatistics();

    let runningBalance = 0;

    const styles = {
      section: { marginBottom: "20px", pageBreakInside: "avoid" },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "8px 0",
        fontSize: "11px",
      },
      th: {
        backgroundColor: "#ecfdf5",
        fontWeight: "600",
        padding: "8px 10px",
        border: "1px solid #d1fae5",
        textAlign: "left",
        fontSize: "11px",
        color: "#047857",
      },
      td: {
        padding: "6px 10px",
        border: "1px solid #e5e7eb",
        verticalAlign: "top",
      },
      textRight: { textAlign: "right" },
    };

    return (
      <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
        <div style={styles.section}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#047857",
            }}
          >
            Sub-Ledger: {selectedAgent?.SL_Name} ({selectedAgent?.SL_Code})
          </h3>
          <table
            style={{ width: "100%", marginBottom: "15px", fontSize: "11px" }}
          >
            <tbody>
              <tr>
                <td>
                  <strong>PAN:</strong> {selectedAgent?.PAN_Number || "N/A"}
                </td>
                <td>
                  <strong>GSTIN:</strong> {selectedAgent?.GSTIN || "N/A"}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Head Ledger:</strong>{" "}
                  {selectedLedger?.Lg_Name || "N/A"}
                </td>
                <td>
                  <strong>Date Range:</strong>{" "}
                  {isDateFilterActive
                    ? `${startDate || "Start"} to ${endDate || "End"}`
                    : "All Dates"}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Total Transactions:</strong> {stats.totalTransactions}
                </td>
                <td>
                  <strong>Report Date:</strong>{" "}
                  {new Date().toLocaleDateString()}
                </td>
              </tr>
              {/* {selectedVoucherType && (
                <tr>
                  <td colSpan="2"><strong>Voucher Type Filter:</strong> {selectedVoucherType}</td>
                </tr>
              )} */}
            </tbody>
          </table>
        </div>

        <div style={styles.section}>
          <h4
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              marginBottom: "8px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "4px",
              color: "#047857",
            }}
          >
            Transaction Details ({filteredTransactions.length} transactions)
          </h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Voucher Type</th>
                <th style={styles.th}>Voucher No</th>
                <th style={styles.th}>Opposite Ledger</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Debit</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Credit</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => {
                runningBalance =
                  runningBalance + transaction.credit - transaction.debit;

                return (
                  <tr key={transaction.id}>
                    <td style={styles.td}>{transaction.date}</td>
                    <td style={styles.td}>{transaction.description}</td>
                    <td style={styles.td}>{transaction.voucher_type}</td>
                    <td style={styles.td}>{transaction.voucher_no}</td>
                    <td style={styles.td}>{transaction.opposite_ledger}</td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        color: "#dc2626",
                      }}
                    >
                      {transaction.debit > 0
                        ? `₹${transaction.debit.toFixed(2)}`
                        : "-"}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        ...styles.textRight,
                        color: "#059669",
                      }}
                    >
                      {transaction.credit > 0
                        ? `₹${transaction.credit.toFixed(2)}`
                        : "-"}
                    </td>
                    <td style={{ ...styles.td, ...styles.textRight }}>
                      {transaction.formatted_running_balance ||
                        `₹${runningBalance.toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: "#fdf2f8", fontWeight: "bold" }}>
                <td
                  colSpan="5"
                  style={{ ...styles.td, textAlign: "right", color: "#be123c" }}
                ></td>
                <td
                  style={{
                    ...styles.td,
                    ...styles.textRight,
                    color: "#be123c",
                  }}
                >
                  ₹{totals.totalDebit.toFixed(2)}
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...styles.textRight,
                    color: "#be123c",
                  }}
                >
                  ₹{totals.totalCredit.toFixed(2)}
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...styles.textRight,
                    color: "#be123c",
                  }}
                >
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

  // Filter ledgers based on search
  const filteredLedgers = uniqueLedgers.filter(
    (ledger) =>
      (ledger.Lg_Name?.toLowerCase() || "").includes(
        ledgerSearch.toLowerCase(),
      ) ||
      (ledger.Lg_Code?.toLowerCase() || "").includes(
        ledgerSearch.toLowerCase(),
      ) ||
      (ledger.Lg_Gr?.toLowerCase() || "").includes(
        ledgerSearch.toLowerCase(),
      ) ||
      (ledger.Lg_Eng_Name?.toLowerCase() || "").includes(
        ledgerSearch.toLowerCase(),
      ),
  );

  // Filter agents based on search
  const filteredAgents = uniqueAgents.filter(
    (agent) =>
      (agent.SL_Name?.toLowerCase() || "").includes(
        agentSearch.toLowerCase(),
      ) ||
      (agent.SL_Code?.toLowerCase() || "").includes(
        agentSearch.toLowerCase(),
      ) ||
      (agent.PAN_Number?.toLowerCase() || "").includes(
        agentSearch.toLowerCase(),
      ) ||
      (agent.GSTIN?.toLowerCase() || "").includes(agentSearch.toLowerCase()),
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totals = calculateTotals();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
      {/* Print Layout Component */}
      {showPrint && (
        <PrintLayout
          title={`Sub-Ledger Report - ${selectedAgent?.SL_Name || ""}`}
          showControls={true}
          onClose={() => setShowPrint(false)}
          organizationData={organisationData}
          orientation={printOrientation}
          onOrientationChange={setPrintOrientation}
        >
          <PrintReportContent />
        </PrintLayout>
      )}

      <div className="px-2 py-6 max-w-full">
        <div className="flex justify-between items-center mb-6">
          <Link to="/finance/dashboard">
            <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium">
              <FiChevronLeft className="mr-1" /> Back to Dashboard
            </button>
          </Link>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPrint(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!selectedAgent || filteredTransactions.length == 0}
            >
              <FiPrinter className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
              disabled={!selectedAgent || filteredTransactions.length == 0}
            >
              <FiFileText className="h-4 w-4 mr-2" />
              Excel
            </button>
          </div>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type == "success"
                ? "bg-green-100 text-green-700"
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

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Sub-Ledger Report
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ledger Selection Dropdown */}
            <div ref={ledgerDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Head Ledger
              </label>
              <div
                className="w-full border border-gray-300 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setShowLedgerDropdown(!showLedgerDropdown)}
              >
                <div className="flex-1">
                  {selectedLedger ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {selectedLedger.Lg_Name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Code: {selectedLedger.Lg_Code}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearLedgerSelection();
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500">
                      Click to select a head ledger...
                    </span>
                  )}
                </div>
                {!selectedLedger &&
                  (showLedgerDropdown ? (
                    <FiChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiChevronDown className="h-5 w-5 text-gray-400" />
                  ))}
              </div>

              {showLedgerDropdown && !selectedLedger && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        ref={ledgerInputRef}
                        type="text"
                        placeholder="Search ledgers..."
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                        onKeyDown={handleLedgerKeyDown}
                        className="w-full border border-gray-300 rounded-lg p-2 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div ref={ledgerListRef} className="max-h-64 overflow-y-auto">
                    {ledgersLoading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">
                          Loading ledgers...
                        </p>
                      </div>
                    ) : filteredLedgers.length == 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {ledgerSearch
                          ? "No matching ledgers found"
                          : "No ledgers with sub-ledgers available"}
                      </div>
                    ) : (
                      filteredLedgers.map((ledger, index) => (
                        <div
                          key={ledger.Lg_Id}
                          className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                            selectedLedgerIndex == index
                              ? "bg-emerald-50 border-l-4 border-l-emerald-500"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleLedgerSelect(ledger)}
                          onMouseEnter={() => setSelectedLedgerIndex(index)}
                        >
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {ledger.Lg_Name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {ledger.Lg_Eng_Name && (
                                <span className="mr-2">
                                  ({ledger.Lg_Eng_Name})
                                </span>
                              )}
                              Code: {ledger.Lg_Code}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {ledger.Lg_Gr}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t flex justify-end">
                    <button
                      onClick={() => setShowLedgerDropdown(false)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Agent Selection Dropdown */}
            <div ref={agentDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Sub-Ledger
              </label>
              <div
                className={`w-full border border-gray-300 rounded-lg p-3 flex justify-between items-center transition-colors ${
                  selectedLedger
                    ? "cursor-pointer hover:bg-gray-50"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
                onClick={() =>
                  selectedLedger &&
                  !selectedAgent &&
                  setShowAgentDropdown(!showAgentDropdown)
                }
              >
                <div className="flex-1">
                  {selectedAgent ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {selectedAgent.SL_Name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Code: {selectedAgent.SL_Code}
                            {selectedAgent.PAN_Number &&
                              ` | PAN: ${selectedAgent.PAN_Number}`}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearAgentSelection();
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500">
                      {selectedLedger
                        ? "Click to select a sub-ledger..."
                        : "Select a head ledger first"}
                    </span>
                  )}
                </div>
                {selectedLedger &&
                  !selectedAgent &&
                  (showAgentDropdown ? (
                    <FiChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiChevronDown className="h-5 w-5 text-gray-400" />
                  ))}
              </div>

              {showAgentDropdown && selectedLedger && !selectedAgent && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        ref={agentInputRef}
                        type="text"
                        placeholder="Search sub-ledgers..."
                        value={agentSearch}
                        onChange={(e) => setAgentSearch(e.target.value)}
                        onKeyDown={handleAgentKeyDown}
                        className="w-full border border-gray-300 rounded-lg p-2 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div ref={agentListRef} className="max-h-64 overflow-y-auto">
                    {agentsLoading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">
                          Loading sub-ledgers...
                        </p>
                      </div>
                    ) : filteredAgents.length == 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {agentSearch
                          ? "No matching sub-ledgers found"
                          : "No sub-ledgers available for this ledger"}
                      </div>
                    ) : (
                      filteredAgents.map((agent, index) => (
                        <div
                          key={agent.SL_Id}
                          className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                            selectedAgentIndex == index
                              ? "bg-emerald-50 border-l-4 border-l-emerald-500"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleAgentSelect(agent)}
                          onMouseEnter={() => setSelectedAgentIndex(index)}
                        >
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {agent.SL_Name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Code: {agent.SL_Code}
                            </p>
                            {agent.PAN_Number && (
                              <p className="text-xs text-gray-400">
                                PAN: {agent.PAN_Number}
                              </p>
                            )}
                            {agent.GSTIN && (
                              <p className="text-xs text-gray-400">
                                GSTIN: {agent.GSTIN}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t flex justify-end">
                    <button
                      onClick={() => setShowAgentDropdown(false)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generate Report Button */}
          <div className="mt-6 pt-6 border-t flex justify-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading || !selectedLedger || !selectedAgent}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <FiCheck className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>

          {/* Voucher Type Filter - Only shown when agent is selected and report generated */}
          {/* {selectedAgent && hasGenerated && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voucher Type Filter
                  </label>
                  <select
                    value={selectedVoucherType}
                    onChange={(e) => setSelectedVoucherType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Voucher Types</option>
                    {uniqueVoucherTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  {(selectedVoucherType || isDateFilterActive) && (
                    <button
                      onClick={resetAllFilters}
                      className="px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )} */}
        </div>

        {/* Filters and Actions - Only shown after report generation */}
        {selectedAgent && hasGenerated && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <div className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                  Transactions: {filteredTransactions.length}
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center border rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                    <FiCalendar className="mr-1 h-4 w-4 text-gray-500" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) =>
                        handleDateFilterChange("start", e.target.value)
                      }
                      className="border-0 p-0 focus:outline-none focus:ring-0"
                      placeholder="From date"
                    />
                  </div>
                  <div className="flex items-center border rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                    <FiCalendar className="mr-1 h-4 w-4 text-gray-500" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) =>
                        handleDateFilterChange("end", e.target.value)
                      }
                      className="border-0 p-0 focus:outline-none focus:ring-0"
                      placeholder="To date"
                    />
                  </div>
                  {isDateFilterActive && (
                    <button
                      onClick={resetDateFilter}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <FiX className="h-3 w-3 mr-1" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <div className="border bg-white rounded-lg flex items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                  <input
                    className="border-0 focus:outline-none text-sm w-full px-2 py-1"
                    placeholder="Search transactions..."
                    disabled={loading}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-emerald-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Voucher Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Voucher No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Opposite Ledger
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Debit (₹)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Credit (₹)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Balance (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-500">
                          Loading transactions...
                        </p>
                      </td>
                    </tr>
                  ) : currentItems.length == 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 bg-gray-50">
                        <div className="flex flex-col items-center">
                          <FiAlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-500">
                            {searchQuery
                              ? `No transactions found matching "${searchQuery}"`
                              : "No transactions found for the selected sub-ledger"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {currentItems.map((transaction, index) => {
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
                            className={`${index % 2 == 0 ? "bg-white" : "bg-gray-50"} hover:bg-sky-50 transition-colors`}
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {transaction.date}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {transaction.description}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="font-medium text-gray-900">
                                {transaction.voucher_type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {transaction.voucher_no}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="font-medium text-gray-900">
                                {transaction.opposite_ledger}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono font-medium text-red-600">
                              {transaction.debit > 0
                                ? `₹${transaction.debit.toFixed(2)}`
                                : "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono font-medium text-green-600">
                              {transaction.credit > 0
                                ? `₹${transaction.credit.toFixed(2)}`
                                : "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-mono font-medium text-gray-900">
                              {transaction.formatted_running_balance ||
                                `₹${currentBalance.toFixed(2)}`}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Totals Row */}
                      {currentItems.length > 0 && (
                        <tr className="bg-pink-50 font-semibold">
                          <td
                            colSpan="5"
                            className="px-4 py-3 text-sm text-right font-semibold text-rose-700"
                          ></td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                            ₹{totals.totalDebit.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
                            ₹{totals.totalCredit.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold font-mono text-rose-700">
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
                              ? "bg-emerald-600 text-white"
                              : "text-emerald-600 hover:bg-emerald-100"
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
        )}
      </div>
    </div>
  );
};

export default SubLedger;
