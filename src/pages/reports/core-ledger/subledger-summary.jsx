import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiAlertCircle,
  FiPrinter,
  FiX,
  FiSearch,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import { RiFileExcel2Line } from "react-icons/ri";
import * as XLSX from "xlsx";
import { BiLoader } from "react-icons/bi";
import axios from "axios";
import { Link } from "react-router-dom";
import PrintLayout from "../../../components/printlayout";
import { useOrganization } from "../../../hooks/useorganization";
import { useFinancialYear } from "../../../context/financialyearcontext";

const SubLedgerSummary = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [reportData, setReportData] = useState(null);
  const [pageTitle, setPageTitle] = useState("Sub Ledger Summary");
  const [hasGenerated, setHasGenerated] = useState(false);

  const [ledgers, setLedgers] = useState([]);
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState("");
  const [appliedLedger, setAppliedLedger] = useState("");
  const [appliedLedgerData, setAppliedLedgerData] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const [isLedgerDropdownOpen, setIsLedgerDropdownOpen] = useState(false);
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState("");
  const ledgerDropdownRef = useRef(null);
  const ledgerSearchRef = useRef(null);

  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [txnFromDate, setTxnFromDate] = useState("");
  const [txnToDate, setTxnToDate] = useState("");
  const [txnSearch, setTxnSearch] = useState("");

  const [showPrint, setShowPrint] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const { organization } = useOrganization();
  const { financialYears, currentFinancialYear } = useFinancialYear();

  useEffect(() => {
    try {
      const menuDetails = JSON.parse(
        localStorage.getItem("menu_details") || "[]",
      );
      const currentPath = "/reports/core-ledger/subledger-summary";
      const currentMenuItem = menuDetails.find(
        (item) => item.Menu_Links == currentPath,
      );
      if (currentMenuItem?.Fnc_Title) setPageTitle(currentMenuItem.Fnc_Title);
    } catch (e) {}
  }, []);

  useEffect(() => {
    const loadLedgers = async () => {
      setLedgerLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/lst-ledgers?per_page=1000`,
          { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
        );
        if (response.data.success) {
          const list = response.data.data?.data || response.data.data || [];
          const filteredList = list.filter((l) => l.Lg_Sub == "yes");
          setLedgers(filteredList);
          setFilteredLedgers(filteredList);
        }
      } catch (e) {
        console.error("Failed to load ledgers:", e);
      } finally {
        setLedgerLoading(false);
      }
    };
    loadLedgers();
  }, []);

  useEffect(() => {
    if (!ledgerSearchTerm.trim()) {
      setFilteredLedgers(ledgers);
    } else {
      const term = ledgerSearchTerm.toLowerCase();
      setFilteredLedgers(
        ledgers.filter(
          (l) =>
            (l.Lg_Name?.toLowerCase() || "").includes(term) ||
            (l.Lg_Code?.toLowerCase() || "").includes(term) ||
            (l.Lg_Eng_Name?.toLowerCase() || "").includes(term),
        ),
      );
    }
  }, [ledgerSearchTerm, ledgers]);

  useEffect(() => {
    const handler = (e) => {
      if (
        ledgerDropdownRef.current &&
        !ledgerDropdownRef.current.contains(e.target)
      ) {
        setIsLedgerDropdownOpen(false);
        setLedgerSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isLedgerDropdownOpen && ledgerSearchRef.current) {
      setTimeout(() => ledgerSearchRef.current.focus(), 0);
    }
  }, [isLedgerDropdownOpen]);

  const formatAmount = (amount) => {
    if (amount == undefined || amount == null || isNaN(amount)) return "";
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return "";
      return num.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return "";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const fetchHeadLedgerTxns = async (ledgerId) => {
    try {
      const params = new URLSearchParams({ ledger_id: ledgerId });
      if (selectedFinancialYear)
        params.append("fin_year", selectedFinancialYear);
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/sub-ledger/balances?${params.toString()}`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );
      if (response.data?.success) {
        setHeadLedgerTxns(response.data.data);
      } else {
        setHeadLedgerTxns(null);
      }
    } catch {
      setHeadLedgerTxns(null);
    }
  };

  const fetchReportData = async (ledgerId) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ledger_id: ledgerId });
      if (selectedFinancialYear)
        params.append("fin_year", selectedFinancialYear);
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/sub-ledger/balances?${params.toString()}`,
        { headers : { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` } }
      );
      if (response.data?.success) {
        setReportData(response.data);
        setMessage({
          text: response.data.message || "Data loaded successfully",
          type: "success",
        });
      } else {
        setReportData(null);
        setMessage({
          text: response.data?.message || "No data available",
          type: "info",
        });
      }
    } catch (err) {
      console.error("Error fetching sub-ledger balances:", err);
      setReportData(null);
      setMessage({
        text: err.response?.data?.message || "Error loading sub-ledger data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const invalidateReport = () => {
    setHasGenerated(false);
    setAppliedLedger("");
    setAppliedLedgerData(null);
    setReportData(null);
    setTxnFromDate("");
    setTxnToDate("");
    setTxnSearch("");
    setMessage({ text: "", type: "" });
  };

  const clearFilters = () => {
    setSelectedLedger("");
    setSelectedFinancialYear("");
    setFromDate("");
    setToDate("");
    invalidateReport();
  };

  const handleGenerateReport = async () => {
    if (!selectedLedger) {
      setMessage({ text: "Please select a ledger.", type: "info" });
      return;
    }
    const ledgerObj = ledgers.find(
      (l) => String(l.Lg_Id) == String(selectedLedger),
    );
    setAppliedLedger(selectedLedger);
    setAppliedLedgerData(ledgerObj || null);
    setHasGenerated(true);
    setMessage({ text: "", type: "" });
    await fetchReportData(selectedLedger);
  };

  const getSelectedLedgerDisplay = () => {
    if (!selectedLedger) return "";
    const l = ledgers.find((x) => String(x.Lg_Id) == String(selectedLedger));
    if (!l) return "Selected ledger not found";
    return l.Lg_Name || l.Lg_Code || "";
  };

  // API response shape:
  // { success, data: { head_ledger: { id, code, name }, sub_ledgers: [ { sub_ledger: { id, code, name, ... }, totals: { total_debit, total_credit, net_balance, balance_type } } ] } }
  const subLedgers = reportData?.data?.sub_ledgers || [];
  const headLedger = reportData?.data?.head_ledger || null;
  const hasData = subLedgers.length > 0;

  const totals = hasData
    ? {
        total_debit: subLedgers.reduce(
          (s, e) => s + (e.totals?.total_debit || 0),
          0,
        ),
        total_credit: subLedgers.reduce(
          (s, e) => s + (e.totals?.total_credit || 0),
          0,
        ),
        net_balance: subLedgers.reduce(
          (s, e) => s + (e.totals?.net_balance || 0),
          0,
        ),
      }
    : null;

  const handleExcelExport = () => {
    const rows = subLedgers.map((entry) => ({
      "Sub Ledger": entry.sub_ledger?.name || "",
      Code: entry.sub_ledger?.code || "",
      "Debit (₹)": entry.totals?.total_debit || 0,
      "Credit (₹)": entry.totals?.total_credit || 0,
      "Balance (₹)": entry.totals?.net_balance || 0,
      Type: entry.totals?.balance_type || "",
    }));
    if (totals) {
      rows.push({
        "Sub Ledger": "GRAND TOTAL",
        Code: "",
        "Debit (₹)": totals.total_debit,
        "Credit (₹)": totals.total_credit,
        "Balance (₹)": totals.net_balance,
        Type: "",
      });
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sub Ledger Summary");
    XLSX.writeFile(wb, `SubLedgerSummary_${headLedger?.name || "report"}.xlsx`);
  };

  const PrintReportContent = () => {
    const styles = {
      page: { fontFamily: "Arial, sans-serif", fontSize: "12px" },
      header: {
        textAlign: "center",
        marginBottom: "8px",
        borderBottom: "2px solid #333",
        paddingBottom: "8px",
      },
      title: { fontSize: "18px", fontWeight: "bold", margin: "5px 0" },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        margin: "0",
        fontSize: "11px",
        tableLayout: "fixed",
      },
      th: {
        backgroundColor: "#ecfdf5",
        fontWeight: "600",
        padding: "8px 10px",
        borderTop: "1px solid #d1fae5",
        borderBottom: "1px solid #d1fae5",
        textAlign: "left",
        color: "#047857",
      },
      thRight: {
        backgroundColor: "#ecfdf5",
        fontWeight: "600",
        padding: "8px 10px",
        borderTop: "1px solid #d1fae5",
        borderBottom: "1px solid #d1fae5",
        textAlign: "right",
        whiteSpace: "nowrap",
        color: "#047857",
      },
      td: {
        padding: "6px 8px",
        borderTop: "1px solid #e5e7eb",
        borderBottom: "1px solid #e5e7eb",
        verticalAlign: "top",
        wordWrap: "break-word",
      },
      textRight: { textAlign: "right", whiteSpace: "nowrap" },
    };

    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>{pageTitle}</h1>
          {headLedger && (
            <p style={{ margin: "4px 0", fontSize: "13px" }}>
              Ledger: {headLedger.name}
            </p>
          )}
        </div>
        <table style={styles.table}>
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead>
            <tr>
              <th style={styles.th}>Sub Ledger</th>
              <th style={styles.thRight}>Debit (₹)</th>
              <th style={styles.thRight}>Credit (₹)</th>
              <th style={styles.thRight}>Balance (₹)</th>
              <th style={styles.th}>Type</th>
            </tr>
          </thead>
          <tbody>
            {subLedgers.map((entry, idx) => (
              <tr key={idx} style={{ backgroundColor: "#ffffff" }}>
                <td style={styles.td}>
                  <div style={{ wordWrap: "break-word" }}>
                    {entry.sub_ledger?.name || ""}
                  </div>
                  {entry.sub_ledger?.code && (
                    <div style={{ fontSize: "10px", color: "#6b7280" }}>
                      {entry.sub_ledger.code}
                    </div>
                  )}
                </td>
                <td style={{ ...styles.td, ...styles.textRight }}>
                  {formatAmount(entry.totals?.total_debit)}
                </td>
                <td style={{ ...styles.td, ...styles.textRight }}>
                  {formatAmount(entry.totals?.total_credit)}
                </td>
                <td style={{ ...styles.td, ...styles.textRight }}>
                  {formatAmount(entry.totals?.net_balance)}
                </td>
                <td style={styles.td}>{entry.totals?.balance_type || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {totals && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px 12px",
              backgroundColor: "#e0f2fe",
              borderTop: "3px solid #0284c7",
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: "14px",
              color: "#0c4a6e",
            }}
          >
            <span>GRAND TOTAL</span>
            <div style={{ display: "flex", gap: "40px" }}>
              <span>Dr: ₹ {formatAmount(totals.total_debit)}</span>
              <span>Cr: ₹ {formatAmount(totals.total_credit)}</span>
              <span>Bal: ₹ {formatAmount(totals.net_balance)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFilters = () => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Financial Year
          </label>
          <select
            value={selectedFinancialYear}
            onChange={(e) => {
              setSelectedFinancialYear(e.target.value);
              if (hasGenerated) invalidateReport();
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors"
          >
            <option value="">Select Financial Year</option>
            {financialYears.map((fy) => (
              <option key={fy.FY_Id} value={fy.FY_Id}>
                {fy.FY_Code}
                {fy.is_current_year ? " (Current)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              if (hasGenerated) invalidateReport();
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              if (hasGenerated) invalidateReport();
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors"
          />
        </div>

        <div className="flex-1" ref={ledgerDropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ledger
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLedgerDropdownOpen(!isLedgerDropdownOpen)}
              className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white hover:bg-gray-50 transition-colors"
            >
              {selectedLedger ? (
                <span className="text-gray-900">
                  {getSelectedLedgerDisplay()}
                </span>
              ) : (
                <span className="text-gray-500">
                  {ledgerLoading ? "Loading ledgers..." : "Select Ledger"}
                </span>
              )}
            </button>
            {ledgerLoading ? (
              <BiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <button
                type="button"
                onClick={() => setIsLedgerDropdownOpen(!isLedgerDropdownOpen)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiChevronDown className="h-4 w-4" />
              </button>
            )}

            {isLedgerDropdownOpen && (
              <div
                className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
                style={{ minWidth: "300px" }}
              >
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={ledgerSearchRef}
                      type="text"
                      value={ledgerSearchTerm}
                      onChange={(e) => setLedgerSearchTerm(e.target.value)}
                      placeholder="Search ledgers..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      autoFocus
                    />
                    {ledgerSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setLedgerSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto max-h-64">
                  {filteredLedgers.length > 0 ? (
                    filteredLedgers.map((l) => (
                      <button
                        key={l.Lg_Id}
                        type="button"
                        onClick={() => {
                          setSelectedLedger(String(l.Lg_Id));
                          setIsLedgerDropdownOpen(false);
                          setLedgerSearchTerm("");
                          if (hasGenerated) invalidateReport();
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-blue-50 ${String(selectedLedger) == String(l.Lg_Id) ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
                      >
                        <div className="text-sm font-medium">{l.Lg_Name}</div>
                        {l.Lg_Code && (
                          <div className="text-xs text-gray-500">
                            {l.Lg_Code}
                          </div>
                        )}
                        {String(selectedLedger) == String(l.Lg_Id) && (
                          <div className="text-xs text-blue-600 mt-1 flex items-center">
                            <FiCheck className="h-3 w-3 mr-1" /> Selected
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <FiSearch className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      <p>No ledgers found</p>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <span className="text-xs text-gray-600">
                    {filteredLedgers.length} ledgers found
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={loading || !selectedLedger || ledgerLoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiCheck className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          {(hasGenerated ||
            appliedLedger ||
            selectedFinancialYear ||
            fromDate ||
            toDate) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
            >
              <FiX className="h-4 w-4 mr-2" />
              Clear Filter
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-2 text-gray-500">Loading sub-ledger data...</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-gray-500">{message.text}</p>
    </div>
  );

  const renderNoData = () =>
    !hasGenerated ? (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Generate report to view results
        </h3>
        <p className="text-gray-600 mb-4">
          Select a <strong>Ledger</strong>, then click{" "}
          <span className="font-medium">Generate Report</span>.
        </p>
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Sub-Ledger Data Found
        </h3>
        <p className="text-gray-600 mb-4">
          No sub-ledger balances available for the selected ledger.
        </p>
        <button
          onClick={clearFilters}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
        >
          <FiX className="h-4 w-4 mr-2" /> Clear Filter
        </button>
      </div>
    );

  // Extract transactions from API response — check all possible locations
  const headLedgerTransactions = (() => {
    if (!reportData) return [];
    const d = reportData.data;
    // Try various keys the API might use
    if (Array.isArray(d?.head_ledger_transactions))
      return d.head_ledger_transactions;
    if (Array.isArray(d?.transactions)) return d.transactions;
    if (Array.isArray(reportData.transactions)) return reportData.transactions;
    if (d?.head_ledger?.transactions) return d.head_ledger.transactions;
    return [];
  })();

  const headLedgerSummary = (() => {
    if (!reportData) return null;
    const d = reportData.data;
    return d?.head_ledger_summary || d?.summary || reportData.summary || null;
  })();

  const getFilteredTxns = () => {
    let filtered = headLedgerTransactions;
    if (txnFromDate)
      filtered = filtered.filter((t) => (t.date || "") >= txnFromDate);
    if (txnToDate)
      filtered = filtered.filter((t) => (t.date || "") <= txnToDate);
    if (txnSearch.trim()) {
      const s = txnSearch.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.voucher_type || t.Vou_Ty || "").toLowerCase().includes(s) ||
          (t.opposite_ledger || t.oppositeLedger || "")
            .toLowerCase()
            .includes(s) ||
          (t.description || t.rmk1 || "").toLowerCase().includes(s),
      );
    }
    return filtered;
  };

  const renderHeadLedgerTxns = () => {
    const txns = getFilteredTxns();
    // Compute totals from visible rows
    const totalDebit = txns.reduce(
      (s, t) => s + (parseFloat(t.debit || t.Dr_Amt) || 0),
      0,
    );
    const totalCredit = txns.reduce(
      (s, t) => s + (parseFloat(t.credit || t.Cr_Amt) || 0),
      0,
    );
    const netBalance = totalCredit - totalDebit;
    const summary = headLedgerSummary || {
      total_debit: totalDebit,
      total_credit: totalCredit,
      net_balance: netBalance,
      balance_type: netBalance >= 0 ? "Cr" : "Dr",
    };

    return (
      <div className="border border-blue-100 rounded-lg overflow-hidden shadow-sm mb-4">
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800">
            {headLedger?.name ||
              appliedLedgerData?.Lg_Name ||
              "Head Ledger Transactions"}
          </h3>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
            Transactions: {txns.length}
          </div>
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:bg-gray-50">
            <input
              type="date"
              value={txnFromDate}
              onChange={(e) => setTxnFromDate(e.target.value)}
              className="border-0 p-0 focus:outline-none focus:ring-0 text-sm"
            />
          </div>
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:bg-gray-50">
            <input
              type="date"
              value={txnToDate}
              onChange={(e) => setTxnToDate(e.target.value)}
              className="border-0 p-0 focus:outline-none focus:ring-0 text-sm"
            />
          </div>
          <div className="ml-auto flex items-center border border-gray-300 rounded-md px-3 py-1.5 bg-white focus-within:ring-2 focus-within:ring-blue-300 min-w-[200px]">
            <FiSearch className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={txnSearch}
              onChange={(e) => setTxnSearch(e.target.value)}
              placeholder="Search transactions..."
              className="border-0 p-0 focus:outline-none text-sm w-full"
            />
            {txnSearch && (
              <button
                onClick={() => setTxnSearch("")}
                className="text-gray-400 hover:text-gray-600 ml-1"
              >
                <FiX className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Voucher Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Opposite Ledger
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Debit (₹)
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Credit (₹)
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Balance (₹)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {txns.length == 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    <FiAlertCircle className="h-6 w-6 mx-auto mb-2" />
                    No transactions found
                  </td>
                </tr>
              ) : (
                txns.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-sky-50">
                    <td className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(txn.date || txn.Vou_Dt)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {txn.description || txn.rmk1 || ""}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
                      {txn.voucher_type || txn.Vou_Ty || ""}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {txn.opposite_ledger || txn.oppositeLedger || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-mono whitespace-nowrap">
                      {txn.debit || txn.Dr_Amt ? (
                        <span className="text-red-600">
                          ₹{formatAmount(txn.debit || txn.Dr_Amt)}
                        </span>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-mono whitespace-nowrap">
                      {txn.credit || txn.Cr_Amt ? (
                        <span className="text-green-600">
                          ₹{formatAmount(txn.credit || txn.Cr_Amt)}
                        </span>
                      ) : (
                        ""
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-mono text-gray-900 whitespace-nowrap">
                      {txn.balance != null
                        ? `₹${formatAmount(txn.balance)}`
                        : ""}
                      {txn.balance_type ? ` ${txn.balance_type}` : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {summary && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end items-center gap-8 font-semibold text-sm">
            <span className="text-gray-700 font-bold uppercase tracking-wide">
              TOTAL:
            </span>
            <span className="font-mono font-bold text-red-600 whitespace-nowrap">
              ₹{formatAmount(summary.total_debit)}
            </span>
            <span className="font-mono font-bold text-green-600 whitespace-nowrap">
              ₹{formatAmount(summary.total_credit)}
            </span>
            <span className="font-mono font-bold text-gray-900 whitespace-nowrap">
              ₹{formatAmount(Math.abs(summary.net_balance))}{" "}
              {summary.balance_type || ""}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderDataTable = () => (
    <div className="space-y-0">
      <div className="border border-blue-100 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-blue-800">
            {headLedger?.name ||
              appliedLedgerData?.Lg_Name ||
              "Sub Ledger Balances"}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <colgroup>
              <col className="w-[40%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                  Sub Ledger
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                  Debit (₹)
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                  Credit (₹)
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-emerald-700 uppercase tracking-wider whitespace-nowrap">
                  Balance (₹)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {subLedgers.map((entry, idx) => (
                <tr key={idx} className="hover:bg-sky-50">
                  <td className="px-4 py-2 text-sm text-gray-900 align-top break-words">
                    <div className="whitespace-normal">
                      {entry.sub_ledger?.name || ""}
                    </div>
                    {entry.sub_ledger?.code && (
                      <div className="text-xs text-gray-400">
                        {entry.sub_ledger.code}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-right font-mono text-gray-900 align-middle whitespace-nowrap">
                    {formatAmount(entry.totals?.total_debit)}
                  </td>
                  <td className="px-4 py-2 text-sm text-right font-mono text-gray-900 align-middle whitespace-nowrap">
                    {formatAmount(entry.totals?.total_credit)}
                  </td>
                  <td className="px-4 py-2 text-sm text-right font-mono text-gray-900 align-middle whitespace-nowrap">
                    {formatAmount(entry.totals?.net_balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totals && (
        <div className="bg-sky-100 px-4 py-3 rounded-lg flex items-center font-bold text-sky-900 border border-sky-200 shadow-sm mt-2">
          <span className="text-base w-[40%]">GRAND TOTAL</span>
          <span className="w-[20%] text-right font-mono">
            ₹ {formatAmount(totals.total_debit)}
          </span>
          <span className="w-[20%] text-right font-mono">
            ₹ {formatAmount(totals.total_credit)}
          </span>
          <span className="w-[20%] text-right font-mono">
            ₹ {formatAmount(totals.net_balance)}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 overflow-hidden">
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

      <div className="px-2 py-6 max-w-full">
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

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {pageTitle}
            </h2>
          </div>

          {renderFilters()}

          {loading && renderLoading()}
          {!loading && message.type == "error" && renderError()}
          {!loading && !hasData && message.type != "error" && renderNoData()}
          {!loading && hasData && (
            <>
              {headLedgerTransactions.length > 0 && renderHeadLedgerTxns()}
              {renderDataTable()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubLedgerSummary;
